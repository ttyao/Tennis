import React from 'react';
import Select from 'react-select';
import LadderSelect from './LadderSelect';
import LadderStats from './LadderStats';
import MatchBrief from './MatchBrief';
import Modal from 'react-modal';
import MatchRecorder from './MatchRecorder';

// var ReactFireMixin = require('reactfire');

var appElement = document.getElementById('modal');
Modal.setAppElement(appElement);

var LadderOverview = React.createClass({
  displayName: 'LadderOverview',
  propTypes: {
    ladder: React.PropTypes.string,
  },
  // mixins: [ReactFireMixin],
  getInitialState () {
    return {
      ladder: this.props.ladder || "ladder:2016-02-11-08-28-55-181:facebook:539060618",
      matches: {},
      loadedMatches:{},
      showAddPlayerModal: false,
      showCreateMatchModal: false,
      players: [],
    };
  },
  componentWillMount() {
    var ref = window.Fbase.getRef("web/data/ladders/"+this.state.ladder);
    var self = this;
    ref.once('value', function(snapshot) {
      var ladder = snapshot.val();
      self.setState({
        matches: ladder.matches,
        players: ladder.users,
        stats: ladder.stats
      });
    });
  },
  onLadderChange(value) {
    this.setState({
      ladder: value,
      loadedMatches: {}
    });

    var ref = window.Fbase.getRef("web/data/ladders/"+value);
    var self = this;
    ref.once('value', function(snapshot) {
      var ladder = snapshot.val();
      self.setState({
        matches: ladder.matches,
        players: ladder.users,
        stats: ladder.stats
      });
    });
  },
  onMatchBriefLoad(matchId, match) {
    if (this.state.matches[matchId]) {
      var matches = this.state.loadedMatches;
      if (!matches[matchId]) {
        matches[matchId] = match;
        this.setState({loadedMatches:matches});
      }
    } else {
      this.setState({loadedMatches: {}});
    }
  },
  getMatchList() {
    if (this.state.matches) {
      var result = [];
      for (let matchId in this.state.matches) {
        result.push(
          <MatchBrief key={matchId} matchId={matchId} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
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
    for (let i in this.state.players) {
      ops.push({value : this.state.players[i], label : window.Fbase.getDisplayName(this.state.players[i])});
    };
    // if (!input) {
    //   console.log(ops)
    //   callback(null, {options:ops, complete: false});
    //   return;
    // }
    userRef.orderByChild("displayName_").once("value", function(snapshot) {
      // input = input.split(",").slice(-1)[0].split(":")[0];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && object[key].displayName) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          ops.push(item);
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },
  onAddPlayerSaveClick() {
    window.Fbase.updateLadderRoster(this.state.players, this.state.ladder);
    this.setState({
      showAddPlayerModal: false,
      players: this.state.players.split(",")
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
  render () {
    console.log(this.state.players);
    return (
      <div>
        <div>
          {false && <span> Filter: {this.getFilter()}</span>}
          {Object.keys(this.state.players).indexOf(window.Fbase.authUid) >=0 &&
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
                <LadderSelect ladder={this.state.ladder} onChange={this.onLadderChange} />
                <LadderStats stats={this.state.stats} ladder={this.state.ladder} matches={this.state.loadedMatches} matchIds={Object.keys(this.state.matches)} />
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
          <Select multi value={Object.keys(this.state.players)} placeholder="Select player(s)" onChange={this.onPlayerSelectChange} asyncOptions={this.loadOptions} />
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
          <MatchRecorder ladder={this.state.ladder} showLadder={false} />
          <button className='floatright' onClick={this.onAddPlayerCancelClick}>Cancel</button>
        </Modal>
      </div>
    );
  }
});

module.exports = LadderOverview;
