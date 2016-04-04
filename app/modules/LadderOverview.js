import React from 'react';
import Select from 'react-select';
import LadderSelect from './LadderSelect';
import LadderStats from './LadderStats';
import MatchBrief from './MatchBrief';
import Modal from 'react-modal';
import MatchRecorder from './MatchRecorder';
import TeamMatches from './TeamMatches';
import TeamStats from "./TeamStats";
import ReactDOM from 'react-dom';

var update = require('react-addons-update');
var TimerMixin = require('react-timer-mixin');

var appElement = document.getElementById('modal');
Modal.setAppElement(appElement);

var LadderOverview = React.createClass({
  displayName: 'LadderOverview',
  propTypes: {
    ladderId: React.PropTypes.string,
    teamId: React.PropTypes.string,
  },
  // mixins: [ReactFireMixin],
  mixins: [TimerMixin],
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
  componentDidMount() {
    let ladderId = this.props.ladderId;
    if (!ladderId) {
      if (Caching.simplePlayers[Fbase.authUid] && Caching.simplePlayers[Fbase.authUid].ladders && Caching.simplePlayers[Fbase.authUid].ladders.length > 0) {
        ladderId = Caching.simplePlayers[Fbase.authUid].ladders[0].ladderId;
      } else {
        ladderId = "l:1";
      }
    }
    this.loadLadder(ladderId, this.props.teamId);
  },
  componentWillUpdate(nextProps, nextState) {
    if (nextProps.teamId != this.props.teamId &&
        JSON.stringify(nextState) == JSON.stringify(this.state)) {
      let ladderId = nextProps.ladderId;
      if (!ladderId) {
        this.loadLadder(this.props.ladderId, this.props.teamId);
      } else {
        this.loadLadder(ladderId, nextProps.teamId);
      }
    }
  },
  loadTeam(ladderId, ladder, playerId) {
    var u = window.Fbase.getRef("web/data/users/"+playerId);
    var self = this;
    u.once("value", function(snapshot) {
      var data = snapshot.val();
      if (data) {
        let teamIds = Object.keys(ladder.teams);
        for (let i in data.teams) {
          if (teamIds.indexOf(i) >= 0) {
            self.loadLadder(ladderId, i);
            return;
          }
        }
        if (data.merges) {
          for (let i in data.merges) {
            if (i.indexOf("n:") == 0) { // hacky way to prevent other merged ids to override default team.
              self.loadTeam(ladderId, ladder, i);
            }
          }
          return;
        }
      }
      self.loadLadder(ladderId, Object.keys(ladder.teams)[0]);
    })
  },
  loadLadder(ladderId, teamId) {
    var self = this;

    // if (!ladderId) {
    //   window.Caching.getSimplePlayer
    //   return;
    // }
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
        if (self.isMounted()) {
          self.setState({
            ladder: ladder,
            ladderId: ladderId,
            players: ladder.users ? Object.keys(ladder.users).join(",") : "",
            loadedMatches: {},
            areas: Object.keys(areas).sort()
          });
        }

        if (ladder.users && Object.keys(ladder.users).length) {
          for (let id in ladder.users) {
            window.Caching.getSimplePlayer(id);
          }
        }
      });
    }

    if (teamId && teamId != this.state.teamId) {
      // console.log(teamId, this.state.teamId,isDefaultTeam)
      // // default team means the user isn't found in current ladder, so showing first team of the ladder.
      // // this should not replace the current teamId.
      // if (isDefaultTeam && this.state.teamId) {
      //   return;
      // }
      ref = window.Fbase.getRef("web/data/teams/"+teamId);
      ref.once("value", function(snapshot) {
        var team = snapshot.val();
        if (self.isMounted()) {
          if (!team) {
            self.setState({team: null, teamId: null, area: null})
          } else {
            team.id = teamId;
            self.setState({team: team, teamId: teamId, area: team.area});
          }
        }
      });
    } else if (!teamId) {
      if (self.isMounted()) {
        self.setState({team: null, teamId: null, area: null})
      }
    }
  },
  onLadderChange(value) {
    this.loadLadder(value);
    this.props.history.push("/ladder/"+value);
    var select = ReactDOM.findDOMNode(this.refs.ladderSelect).getElementsByTagName('input')[1];
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
  isMyActiveMatch(matchId) {
    if (!window.Fbase.authUid || !this.state.loadedMatches[matchId] || this.state.loadedMatches[matchId].status != "active") {
      return false;
    }
    return this.state.loadedMatches[matchId].players.indexOf(window.Fbase.authUid) >= 0;
  },
  getMatchList() {
    if (this.state.ladder.type == "normal") {
      var result = [];
      for (let matchId in this.state.ladder.matches) {
        if (!this.isMyActiveMatch(matchId)) {
          result.push(
            <MatchBrief key={matchId} matchId={matchId} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
        }
      }
      for (let matchId in this.state.ladder.matches) {
        if (this.isMyActiveMatch(matchId)) {
          result.push(
            <MatchBrief key={matchId} matchId={matchId} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
        }
      }
      return (<div>{result.reverse()}</div>);
    } else {
      var result = [];
      for (let teamMatchId in this.state.ladder.teamMatches) {
        result.push(
          <TeamMatches key={teamMatchId} teamMatchId={teamMatchId} type={this.state.ladder.type} ladder={this.state.ladder} onAfterLoad={this.onMatchBriefLoad} />);
      }
      if (this.state.team) {
        if (!this.state.team.matches) {
          return (<div>Match schedule hasn't been published yet.</div>);
        }
        for (let teamMatchId in this.state.team.matches) {
          result.push(
            <TeamMatches key={teamMatchId} teamMatchId={teamMatchId} type={this.state.ladder.type} ladder={this.state.ladder}  onAfterLoad={this.onMatchBriefLoad} />);
        }
        return (<div>{result}</div>);
      }
      return (<div>{result.reverse()}</div>);
    }
  },
  AddPlayerClick() {
    this.setState({showAddPlayerModal: true});
  },
  loadOptions(input, callback) {
    var userRef = window.Fbase.getRef("web/data/users");
    var ops = [];
    var keys = this.state.players.split(",");

    for (let i in keys) {
      ops.push({value : keys[i], label : window.Caching.getDisplayName(keys[i])});
    };
    if (!input || typeof(input) != "string") {
      this.setTimeout(function() {callback(null, {options: ops, complete: false});}, 0);
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
          Caching.setSimplePlayer(key, object[key]);
          ops.push(item);
          keys.push(key);
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },
  onAddPlayerSaveClick() {
    window.Fbase.updateLadderRoster(this.state.players, this.state.ladder);
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
    location.reload();
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
    if (this.state.ladder.type != "normal" && this.state.team) {
      var options = [];
      var teams = [];
      for (let a in this.state.areas) {
        options.push(<option label={this.state.areas[a]} value={this.state.areas[a]}/>);
      }
      for (let a in this.state.ladder.teams) {
        if (this.state.ladder.teams[a].area == this.state.team.area) {
          teams.push(<option label={this.state.ladder.teams[a].displayName} value ={a} />);
        }
      }
      return (
        <tr>
          <td className='rightalign smallpercent'>Area:</td>
          <td className="smallpercent"><select onChange={this.onAreaChange} value={this.state.area}>{options}</select></td>
          <td className='rightalign smallpercent'>Team:</td>
          <td><select className="teamSelect" onChange={this.onTeamChange} value={this.state.teamId}>{teams}</select></td>
        </tr>
      );
    }
  },
  getMegaphone() {
    return null;
  },
  render () {
    if (!this.state.ladder) {
      return (<div style={{height:"80vh",background:"url(/images/roundPreloader.gif) no-repeat center center"}}/>);
    }
    let max = 500;
    var modalStyle = {
      content: {
        padding: "20px 0",
        top: "10px",
        bottom: "10px",
        left: window.innerWidth > max ? ((innerWidth-max)/2)+"px" : "10px",
        right: "10px",
        maxWidth: max+"px"
      }
    }
    return (
      <div>
        <div>
          {this.state.players && Fbase.authUid && this.state.players.indexOf(Fbase.authUid) >=0 &&
            <div>
              <button onClick={this.createMatchClick} style={{margin: "0 5px"}}>Create Match</button>
              <button onClick={this.AddPlayerClick} style={{margin: "0 5px"}}>Roster</button>
            </div>
          }
        </div>
        <table className="wholerow">
          <tbody>
            <tr>
              <td className='rightalign smallpercent'>Ladder:</td>
              <td colSpan="3" className="playersection">
                <span className="section">
                  <LadderSelect ref="ladderSelect" ladder={this.state.ladder} onChange={this.onLadderChange} />
                </span>
              </td>
            </tr>
          {this.getTeamSelect()}
          </tbody>
        </table>
        {this.getMegaphone()}
        <LadderStats team={this.state.team} ladder={this.state.ladder} loadedMatches={this.state.loadedMatches} />
        <TeamStats team={this.state.team} loadedMatches={this.state.loadedMatches} />
        {this.getMatchList()}
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          style={modalStyle}
          isOpen={this.state.showAddPlayerModal}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className="wholerow">
            Players:
            <button className='rightalign' style={{margin: "5px 5px"}} onClick={this.onAddPlayerSaveClick}>Save</button>
            <button className='rightalign' onClick={this.onAddPlayerCancelClick}>Cancel</button>
          </div>
          <div style={{padding: "5px"}}>
            <Select multi value={this.state.players ? this.state.players.split(",") : null} placeholder="Select player(s)" onChange={this.onPlayerSelectChange} asyncOptions={this.loadOptions} />
          </div>
        </Modal>
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          style={modalStyle}
          isOpen={this.state.showCreateMatchModal}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className="centerContainer"><b>Create new match</b></div>
          <MatchRecorder ladder={this.state.ladder} showLadder={false} onMatchCreated={this.onMatchCreated} onCancel={this.onAddPlayerCancelClick} />
        </Modal>
      </div>
    );
  }
});

module.exports = LadderOverview;
