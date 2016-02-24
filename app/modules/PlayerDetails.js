import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
var ReactFireMixin = require('reactfire');

var PlayerDetails = React.createClass({
  getInitialState () {
    var playerId = window.Fbase.authUid || window.Fbase.Henry;
    if (this.props.playerId) {
      console.log("init", this.props.playerId, window.Fbase.displayNames, window.Fbase.getUserId(this.props.playerId))
      playerId = window.Fbase.getUserId(this.props.playerId);
    }
    return {playerId: playerId, win1: 0, win2: 0};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    if (this.state.playerId) {
      // var ref = window.Fbase.getRef("web/data/users/"+this.state.playerId+"/matches");
      // this.bindAsArray(ref, "matches");
      var player = window.Fbase.getRef("web/data/users/"+this.state.playerId);
      this.bindAsObject(player, "player");
    }
  },
  componentWillUpdate(nextProps, nextState) {
    if (this.state.playerId == nextState.playerId && this.props.playerId != nextProps.playerId) {
      this.setState({playerId: nextProps.playerId});
      var player = window.Fbase.getRef("web/data/users/"+nextProps.playerId);
      this.unbind("player");
      this.bindAsObject(player, "player");
    }
  },
  shouldComponentUpdate(nextProps, nextState) {
    // return JSON.stringify(nextState) != JSON.stringify(this.state) ||
    //        JSON.stringify(nextProps) != JSON.stringify(this.props)
    return true;
  },
  onMatchBriefLoad(matchId, match) {
    // var players = match.players;
    // var qualified = false;

    // if (!this.state.player1 || !this.state.player0) {
    //   return;
    // }

    // if (!players) {
    //   console.log("players not found "+matchId);
    // } else if (this.state.player0 == players[0] || this.state.player0 == players[2]) {
    //   qualified = (this.state.player1 == players[1] || this.state.player1 == players[3]);
    // } else if (this.state.player0 == players[1] || this.state.player0 == players[3]) {
    //   qualified = (this.state.player1 == players[0] || this.state.player1 == players[2]);
    // }

    // if (this.state["qualified"+matchId] != qualified) {
    //   var newState = {};
    //   newState["qualified"+matchId] = qualified;
    //   // this.setState(newState);
    //   this.calculateWinLoss();
    // }
  },
  calculateWinLoss() {
    var matchWin = 0;
    var totalMatch = 0;
    var player0 = this.state.player0;
    var player1 = this.state.player1;
    this.state.player.matches.forEach(function(match) {
      var setWin = 0;
      var qualified = false;
      if (match.players) {
        if (player0 == match.players[0] || player0 == match.players[2]) {
          qualified = (player1 == match.players[1] || player1 == match.players[3]);
        } else if (player0 == match.players[1] || player0 == match.players[3]) {
          qualified = (player1 == match.players[0] || player1 == match.players[2]);
        }
        if (qualified) {
          totalMatch++;
          match.scores.forEach(function(set){
            if (set.scores[0] > set.scores[1]) {
              setWin++;
            } else {
              setWin--;
            }
          });
          if (setWin >= 0 && (player0 == match.players[0] || player0 == match.players[2] ) ||
              setWin <= 0 && (player0 == match.players[1] || player0 == match.players[3] )) {
            matchWin++;
          }
        }
      }
    });
    this.setState({
      win1: matchWin,
      win2: totalMatch - matchWin
    });
  },
  onPlayerChange(value){
    window.Fbase.log("head2head 1st player changed to: " + value, "query");
    this.setState({playerId: value});
    var ref = window.Fbase.getRef("web/data/users/"+value);
    // var self = this;
    this.unbind("player");
    this.bindAsObject(ref, "player");
    // ref.once('value', function(snapshot) {
    //   self.setState({matches:snapshot.val()});
    // })

    this.props.history.push("/player/0/"+value)
  },
  onPlayer1Change(value){
    window.Fbase.log("head2head 2nd player changed to: " + value, "query");
    this.setState({player1: value});
    var ref = window.Fbase.getRef("web/data/users/"+value+"/matches");
    this.unbind("matches");
    this.bindAsArray(ref, "matches");
  },
  getPlayerDetails() {
    if (this.state.player) {
      return (
        <div className="matchBriefBody">
          <div>Total Matches: {Object.keys(this.state.player.matches).length} </div>
          {this.state.player.ntrp && <div>NTRP: {this.state.player.ntrp}</div>}
          {this.state.player.residence && <div>Residence: {this.state.player.residence}</div>}
        </div>
      );
    }
  },
  render() {

    if (this.state.player) {
      console.log(this.state.player)
      var matches = [];
      if (this.state.player.matches) {
        var keys = Object.keys(this.state.player.matches);
        for (let key in this.state.player.matches) {
          matches.push(<MatchBrief key={key} matchId={key} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
        }
      }
      return (
        <div>
          <table className="wholerow">
            <tbody><tr>
              <td>
                <PlayerSelect player={this.state.player} playerId={this.state.playerId} onChange={this.onPlayerChange} />
              </td>
            </tr><tr>
              <td className="centerContainer">
                {this.getPlayerDetails()}
              </td>
            </tr></tbody>
          </table>
          { this.state.player.matches ? matches.reverse() : "loading..."}
        </div>
      );
    }
    return null;
  }
});

module.exports = PlayerDetails;
