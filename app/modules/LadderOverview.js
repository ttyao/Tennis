import React from 'react';
import Select from 'react-select';
import LadderSelect from './LadderSelect';
import LadderStats from './LadderStats';
import MatchBrief from './MatchBrief';
import Modal from 'react-modal';
import MatchRecorder from './MatchRecorder';
import TeamMatches from './TeamMatches';
import ReactDOM from 'react-dom';

var update = require('react-addons-update');

var appElement = document.getElementById('modal');
Modal.setAppElement(appElement);

var LadderOverview = React.createClass({
  displayName: 'LadderOverview',
  propTypes: {
    ladderId: React.PropTypes.string,
  },
  // mixins: [ReactFireMixin],
  getInitialState () {
    return {
      matches: {},
      loadedMatches:{},
      showAddPlayerModal: false,
      showCreateMatchModal: false,
      players: "",
      type: "normal"
    };
  },
  componentWillMount() {
    this.loadLadder(this.props.ladderId || "ladder:2016-02-15-07-42-03-177:facebook:539060618", this.props.teamId);
  },
  loadTeam(ladderId, ladder, playerId) {
    var u = window.Fbase.getRef("web/data/users/"+playerId);
    var self = this;
    u.once("value", function(snapshot) {
      var data = snapshot.val();
      if (data) {
        console.log(ladder)
        let teamIds = Object.keys(ladder.teams);
        for (let i in data.teams) {
          if (teamIds.indexOf(i) >= 0) {
            self.loadLadder(ladderId, i);
            return;
          }
        }
        if (data.merges) {
          for (let i in data.merges) {
            self.loadTeam(ladderId, ladder, i);
          }
        }
      } else {
        self.loadLadder(ladderId, Object.keys(ladder.teams)[0]);
      }
    })
  },
  loadLadder(ladderId, teamId) {
    var self = this;
    if (ladderId != this.state.ladderId) {
      var ref = window.Fbase.getRef("web/data/ladders/"+ladderId);
      ref.once('value', function(snapshot) {
        var ladder = snapshot.val();
        if (!ladder) {
          self.setState({ ladder: null, ladderId: null });
          return;
        }
        ladder.matches = ladder.matches || {}
        ladder.teamMatches = ladder.teamMatches || {}
        ladder.type = ladder.type || "normal"
        ladder.id = ladderId

        var areas = {}
        if (ladder.teams) {
          for (let i in ladder.teams) {
            if (!areas[ladder.teams[i].area]) {
              areas[ladder.teams[i].area] = ladder.teams[i].area;
            }
          }
          if (!teamId) {
            if (window.Fbase.authUid) {
              self.loadTeam(ladderId, ladder, window.Fbase.authUid);
            } else {
              self.loadLadder(ladderId, Object.keys(ladder.teams)[0]);
            }

          }
        }

        self.setState({
          ladder: ladder,
          ladderId: ladderId,
          players: ladder.users ? Object.keys(ladder.users).join(",") : "",
          loadedMatches: {},
          areas: areas
        });

        if (ladder.users && Object.keys(ladder.users).length) {
          for (let id in ladder.users) {
            window.Fbase.getDisplayName(id);
          }
        }
      });
    }

    if (teamId && teamId != this.state.teamId) {
      ref = window.Fbase.getRef("web/data/teams/"+teamId);
      ref.once("value", function(snapshot) {
        var team = snapshot.val();
        if (!team) {
          self.setState({team: null, teamId: null, area: null})
        } else {
          team.id = teamId;
          self.setState({team: team, teamId: teamId, area: team.area});
        }
      });
    }
  },
  onLadderChange(value) {
    this.loadLadder(value);
    this.props.history.push("/ladder/"+value);
    var select = ReactDOM.findDOMNode(this.refs.ladderSelect).getElementsByTagName('input')[1];
    // console.log(select)
    select.blur();
  },
  onMatchBriefLoad(matchId, match) {

    // if (this.state.ladder.matches[matchId]) {
      var matches = this.state.loadedMatches;
      if (!matches[matchId]) {
        matches[matchId] = match;
        this.setState({loadedMatches:matches});
      }
      // console.log("loaded", matches)
    // }
  },
  getMatchList() {
    if (this.state.ladder.type == "normal") {
      var result = [];
      for (let matchId in this.state.ladder.matches) {
        result.push(
          <MatchBrief key={matchId} matchId={matchId} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
      }
      return (<div>{result.reverse()}</div>);
    } else {
      var result = [];
      for (let teamMatchId in this.state.ladder.teamMatches) {
        result.push(
          <TeamMatches key={teamMatchId} teamMatchId={teamMatchId} type={this.state.ladder.type} ladder={this.state.ladder} onAfterLoad={this.onMatchBriefLoad} />);
      }
      if (this.state.team) {
        for (let teamMatchId in this.state.team.matches) {
          result.push(
            <TeamMatches key={teamMatchId} teamMatchId={teamMatchId} type={this.state.ladder.type} ladder={this.state.ladder}  onAfterLoad={this.onMatchBriefLoad} />);
        }
      }
      return (<div>{result.reverse()}</div>);
    }
  },
  AddPlayerClick() {
    this.setState({showAddPlayerModal: true});
  },
  getFilter() {
    var players = [];
    for (let matchId in this.state.loadedMatches) {
      for (let player in this.state.loadedMatches[matchId].players) {
        if (players.indexOf(window.Fbase.getDisplayName(this.state.loadedMatches[matchId].players[player])) < 0) {
          players.push(window.Fbase.getDisplayName(this.state.loadedMatches[matchId].players[player]));
        }
      }
    }
    // console.log(this.state.loadedMatches);
    players.sort();
    var options = [];
    for (let i in players) {
      options.push(<option key={window.Fbase.getUserId(players[i])} value={window.Fbase.getUserId(players[i])} label={players[i]} />);
    }

    return (
      <select>
        <option label="Show All" value="all"/>
        <option label="Show Completed" value="completed"/>
        <option label="Show Uncompleted" value="uncompleted" />
        <option label="----------------" value="none" />
        {options}
      </select>
    );
  },
  loadOptions(input, callback) {
    var userRef = window.Fbase.getRef("web/data/users");
    var ops = [];
    var keys = this.state.players.split(",");

    for (let i in keys) {
      ops.push({value : keys[i], label : window.Fbase.getDisplayName(keys[i])});
    };
    // if (!input) {
    //   console.log(ops)
    //   callback(null, {options:ops, complete: false});
    //   return;
    // }
    if (typeof(input) != "string") {
      callback(null, {options:ops, complete: false});
      return;
    }
    userRef.orderByChild("displayName_").startAt(input.toLowerCase()).limitToFirst(20).once("value", function(snapshot) {
      // input = input.split(",").slice(-1)[0].split(":")[0];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && object[key].displayName && keys.indexOf(key) < 0) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          window.Fbase.setDisplayName(key, item.label);
          ops.push(item);
          keys.push(key);
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },
  onAddPlayerSaveClick() {
    window.Fbase.updateLadderRoster(this.state.players, this.state.ladderId);
    this.setState({
      showAddPlayerModal: false,
      players: this.state.players
    });
  },
  onAddPlayerCancelClick() {
    this.setState({
      showAddPlayerModal: false,
      showCreateMatchModal: false
    });
  },
  onPlayerSelectChange(value) {
    this.setState({players:value});
  },
  createMatchClick() {
    this.setState({showCreateMatchModal: true});
  },
  onMatchCreated() {
    this.setState({showCreateMatchModal: false});
  },
  onTeamChange(event) {
    this.loadLadder(this.state.ladderId, event.target.value);
    this.props.history.push("/ladder/"+this.state.ladderId+"/"+event.target.value);
  },
  onAreaChange(event) {
    var area = event.target.value;
    for (var i in this.state.ladder.teams) {
      if (this.state.ladder.teams[i].area == area) {
        this.loadLadder(this.state.ladderId, i);
        this.props.history.push("/ladder/"+this.state.ladderId+"/"+i);
        return;
      }
    }
  },
  getTeamSelect() {
    if (this.state.ladder.type && this.state.ladder.type != "normal" && this.state.team) {
      var options = [];
      var teams = [];
      for (let a in this.state.areas) {
        options.push(<option label={a} value={a} />);
      }
      for (let a in this.state.ladder.teams) {
        if (this.state.ladder.teams[a].area == this.state.team.area) {
          teams.push(<option label={this.state.ladder.teams[a].displayName} value ={a} />);
        }
      }
      return (
        <div>
          Area: <select onChange={this.onAreaChange} defaultValue={this.state.area}>{options}</select> Team: <select className="teamSelect" onChange={this.onTeamChange} defaultValue={this.state.teamId}>{teams}</select>
        </div>
      );
    }
  },
  render () {
    if (!this.state.ladder) {
      return (
        <table className="wholerow">
          <tbody><tr>
            <td className="playersection">
              <span className="section">
                <LadderSelect ref="ladderSelect" ladder={this.state.ladder} onChange={this.onLadderChange} />
                <LadderStats team={this.state.team} ladder={this.state.ladder} loadedMatches={this.state.loadedMatches} />
              </span>
            </td>
          </tr></tbody>
        </table>);
    }
    return (
      <div>
        <div>
          {false && <span> Filter: {this.getFilter()}</span>}
          {this.state.players && this.state.players.indexOf(window.Fbase.authUid) >=0 &&
            <div>
              <button className="floatright" onClick={this.createMatchClick}>Create Match</button>
              <button onClick={this.AddPlayerClick}>Roster</button>
            </div>
          }
        </div>
        <table className="wholerow">
          <tbody><tr>
            <td className="playersection">
              <span className="section">
                <LadderSelect ref="ladderSelect" ladder={this.state.ladder} onChange={this.onLadderChange} />
                {this.getTeamSelect()}
                <LadderStats team={this.state.team} ladder={this.state.ladder} loadedMatches={this.state.loadedMatches} />
              </span>
            </td>
          </tr></tbody>
        </table>
        {this.getMatchList()}
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          isOpen={this.state.showAddPlayerModal}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div>Add new player:</div>
          <Select multi value={this.state.players ? this.state.players.split(",") : null} placeholder="Select player(s)" onChange={this.onPlayerSelectChange} asyncOptions={this.loadOptions} />
          <button className='floatright' onClick={this.onAddPlayerSaveClick}>Save</button>
          <button className='floatright' onClick={this.onAddPlayerCancelClick}>Cancel</button>
        </Modal>
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          isOpen={this.state.showCreateMatchModal}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div><b>Create new match</b></div>
          <MatchRecorder ladder={this.state.ladder} showLadder={false} onMatchCreated={this.onMatchCreated} />
          <button className='floatright' onClick={this.onAddPlayerCancelClick}>Cancel</button>
        </Modal>
      </div>
    );
  }
});

module.exports = LadderOverview;
