import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
var ReactFireMixin = require('reactfire');

var Head2Head = React.createClass({
  getInitialState () {
    return {player1: this.props.player1 ? this.props.player1 : "facebook:539060618", player2: this.props.player2, win1: 0, win2: 0};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    if (this.state.player1) {
      var ref = window.Fbase.getRef("web/data/users/"+this.state.player1+"/matches");
      this.bindAsArray(ref, "matches");
    }
  },
  onMatchBriefLoad(matchId, players) {
    var qualified = false;

    if (!this.state.player2) {
      return;
    }
    if (!players) {
      console.log("players not found");
      return;
    }

    if (this.state.player1 == players.player1 || this.state.player1 == players.player3) {
      qualified = (this.state.player2 == players.player2 || this.state.player2 == players.player4);
    } else if (this.state.player1 == players.player2 || this.state.player1 == players.player4) {
      qualified = (this.state.player2 == players.player1 || this.state.player2 == players.player3);
    }

    if (this.state["qualified"+matchId] != qualified) {
      var newState = {};
      newState["qualified"+matchId] = qualified;
      console.log(newState);
      this.setState(newState);
      this.calculateWinLoss();
    }
  },
  calculateWinLoss() {
    var matchWin = 0;
    var totalMatch = 0;
    var player1 = this.state.player1;
    var player2 = this.state.player2;
    this.state.matches.forEach(function(match) {
      var setWin = 0;
      var qualified = false;
      if (player1 == match.players.player1 || player1 == match.players.player3) {
        qualified = (player2 == match.players.player2 || player2 == match.players.player4);
      } else if (player1 == match.players.player2 || player1 == match.players.player4) {
        qualified = (player2 == match.players.player1 || player2 == match.players.player3);
      }
      if (qualified) {
        totalMatch++;
        match.scores.forEach(function(set){
          console.log(set);
          if (set.scores[0] > set.scores[1]) {
            setWin++;
          } else {
            setWin--;
          }
        });
        if (setWin >= 0 && (player1 == match.players.player1 || player1 == match.players.player3 ) ||
            setWin <= 0 && (player1 == match.players.player2 || player1 == match.players.player4 )) {
          matchWin++;
        }
      }
    });
    this.setState({
      win1: matchWin,
      win2: totalMatch - matchWin
    });
  },
  onPlayer1Change(value){
    this.setState({player1: value});
    var ref = window.Fbase.getRef("web/data/users/"+value+"/matches");
    this.unbind("matches");
    this.bindAsArray(ref, "matches");
  },
  onPlayer2Change(value){
    console.log(value);
    this.setState({player2: value});
    var ref = window.Fbase.getRef("web/data/users/"+value+"/matches");
    this.unbind("matches");
    this.bindAsArray(ref, "matches");
  },

  render() {
    var matches = this.state.matches.map(function(match) {
      return (
        <MatchBrief key={match['.key']} matchId={match['.key']} visible={this.state["qualified"+[match['.key']]]} onAfterLoad={this.onMatchBriefLoad} />
      );
    }, this);
    return (
      <div>
        <table className="wholerow">
          <tbody><tr>
            <td>
              <PlayerSelect key="player1" player={this.state.player1} onChange={this.onPlayer1Change} />
            </td>
            <td>
              <PlayerSelect key="player2" player="" onChange={this.onPlayer2Change} />
            </td>
          </tr><tr>
            <td className="centerContainer"> {this.state.win1} </td>
            <td className="centerContainer"> {this.state.win2} </td>
          </tr></tbody>
        </table>
        { matches.reverse() }
      </div>
    );
  }
});

module.exports = Head2Head;
