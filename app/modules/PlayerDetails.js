import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
var ReactFireMixin = require('reactfire');

var PlayerDetails = React.createClass({
  getInitialState () {
    var playerId = window.Fbase.authUid || window.Fbase.Henry;
    if (this.props.playerId) {
      playerId = window.Fbase.getUserId(this.props.playerId);
    }
    return {playerId: playerId, win1: 0, win2: 0};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    if (this.state.playerId) {
      this.bindPlayer(this.state.playerId);
    }
  },
  bindPlayer(playerId) {
    var player = window.Fbase.getRef("web/data/users/"+playerId);
    var self = this;
    player.once("value", function(snapshot) {
      var data = snapshot.val();
      if (data) {
        if (data.claimerId) {
          self.props.history.push("/player/0/"+data.claimerId)
          self.bindPlayer(data.claimerId);
          return;
        }
        self.bindAsObject(player, "player");
        if (data.merges) {
          var index = 0;
          for (let i in data.merges) {
            var ref = window.Fbase.getRef("web/data/users/"+i);
            self.bindAsObject(ref, "merge"+index);
            index++;
          }
          self.setState({merges: Object.keys(data.merges).length})
        } else {
          self.setState({merges: null})
        }
      }
    })
  },
  unbindPlayer() {
    try {
      this.unbind("player");
      for (let i = 0; i < this.state.merges; i++) {
        this.unbind("merge"+i);
      }
    } catch (exception) {

    }
  },
  componentWillUpdate(nextProps, nextState) {
    if (this.state.playerId == nextState.playerId && this.props.playerId != nextProps.playerId) {
      this.setState({playerId: nextProps.playerId});
      this.unbindPlayer();
      this.bindPlayer(nextProps.playerId);
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
            if (set[0] > set[1]) {
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
    this.unbindPlayer();
    this.bindPlayer(value);

    this.props.history.push("/player/0/"+value)
  },
  onNorcalIdEntered(event) {
    if (event.key == 'Enter' && event.target.value) {
      window.Fbase.mergeNorcalAccount(event.target.value, this.state.playerId);
    }
  },
  getPlayerDetails() {
    if (this.state.player) {
      return (
        <div className="matchBriefBody">
          <table className="wholerow"><tbody><tr>
            <td><b>NTRP:</b></td>
            {this.state.player.ntrp ?
              <td>{this.state.player.ntrp}{this.state.player.ntrpType}</td> :
              null
            }
            <td><b>City:</b></td>
            {this.state.player.residence && <td>{this.state.player.residence}</td>}
          </tr></tbody></table>
          {window.Fbase.authUid == window.Fbase.Henry && !this.state.player.norcal &&
            <input ref="norcalIdInput" onKeyPress={this.onNorcalIdEntered}/>
          }
        </div>
      );
    }
  },
  getMatches() {
    var m = [];
    if (this.state.player.matches) {
      var keys = Object.keys(this.state.player.matches);
      for (let key in this.state.player.matches) {
        m.push({key:key, matchTime:this.state.player.matches[key].matchTime})
        // console.log(this.state.player.matches[key]);
      }
    }
    if (this.state.merges) {
      for (let i = 0; i< this.state.merges; i++) {
        if (this.state["merge"+i]) {
          var keys = Object.keys(this.state["merge"+i].matches);
          for (let key in this.state["merge"+i].matches) {
            m.push({key:key, matchTime:this.state["merge"+i].matches[key].matchTime});
            console.log(this.state["merge"+i].matches[key]);
          }
        }
      }
    }
    var result = [];
    var visited = {};
    for (let i in m) {
      // console.log(visited)
      let candidate = -1;
      for (let j in m) {
        if (!visited[j] && (candidate < 0 || m[j].matchTime > m[candidate].matchTime)) {
          candidate = j;
        }
      }
      // console.log(candidate, m[candidate])
      result.push(
        <MatchBrief key={m[candidate].key} matchId={m[candidate].key} showTeam={true} visible={true} onAfterLoad={this.onMatchBriefLoad} />
      );
      visited[candidate] = true;
    }
    return result;
  },
  render() {
    if (this.state.player) {
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
          { this.state.player.matches ? this.getMatches() : ""}
        </div>
      );
    }
    return null;
  }
});

module.exports = PlayerDetails;
