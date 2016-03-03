import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
import TeamName from "./TeamName";
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
    console.log("start binding player: " + playerId, window.now().slice(10))
    var player = window.Fbase.getRef("web/data/users/"+playerId);
    var self = this;
    player.once("value", function(snapshot) {
      console.log("retrived data for player: " + playerId, window.now().slice(10))
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
  getCurrentTeams() {
    var t = [];
    var loadedKeys = {};
    if (this.state.player.teams) {
      var keys = Object.keys(this.state.player.teams);
      for (let key in this.state.player.teams) {
        if (!loadedKeys[key]) {
          t.push({key: key, type:"team", date: new Date(this.state.player.teams[key].date)});
          loadedKeys[key] = true;
        }
      }
    }
    if (this.state.player.ladders) {
      var keys = Object.keys(this.state.player.ladders);
      for (let key in this.state.player.ladders) {
        if (!loadedKeys[key]) {
          t.push({key: key, type:"ladder", date: new Date(this.state.player.ladders[key].date)});
          loadedKeys[key] = true;
        }
      }
    }
    if (this.state.merges) {
      for (let i = 0; i< this.state.merges; i++) {
        if (this.state["merge"+i]) {
          if (this.state["merge"+i].teams) {
            var keys = Object.keys(this.state["merge"+i].teams);
            for (let key in this.state["merge"+i].teams) {
              if (!loadedKeys[key]) {
                t.push({key:key, type:"team", date:new Date(this.state["merge"+i].teams[key].date)});
                loadedKeys[key] = true;
              }
            }
          }
          if (this.state["merge"+i].ladders) {
            var keys = Object.keys(this.state["merge"+i].ladders);
            for (let key in this.state["merge"+i].ladders) {
              if (!loadedKeys[key]) {
                t.push({key:key, type:"ladder", date:new Date(this.state["merge"+i].ladders[key].date)});
                loadedKeys[key] = true;
              }
            }
          }
        }
      }
    }
    var visited = {};
    var result = []
    for (let i in t) {
      let candidate = -1;
      for (let j in t) {
        if (!visited[j] && (candidate < 0 || t[candidate].date < t[j].date)) {
          candidate = j;
        }
      }
      visited[candidate] = true;
      if (t[candidate].type == "team") {
        result.push(<TeamName key={t[candidate].key} teamId={t[candidate].key} />);
      } else {
        result.push(<TeamName key={t[candidate].key} ladderId={t[candidate].key} />);
      }
      if (result.length > 4) {
        return result;
      }
    }
    return result;
  },
  getNTRP(ntrp) {
    if (!ntrp) {
      return null;
    }
    if (ntrp == Math.floor(ntrp)) {
      return ntrp+".0"
    }
    return ntrp;
  },
  getPlayerDetails() {
    if (this.state.player) {
      return (
        <div className="matchBriefBody">
          <table className="wholerow"><tbody>
            <tr>
              <td className="rightalign"><b>NTRP:</b></td>
              {this.state.player.ntrp ?
                <td className="leftalign">{this.getNTRP(this.state.player.ntrp)}{this.state.player.ntrpType}</td> :
                null
              }
              <td className="rightalign"><b>City:</b></td>
              {this.state.player.residence && <td  className="leftalign">{this.state.player.residence}</td>}
            </tr>
            <tr>
              <td className="rightalign"><b>Recent:</b></td>
              <td className="leftalign" colSpan="3">{this.getCurrentTeams()}</td>
            </tr>
          </tbody></table>
          {window.Fbase.authUid == window.Fbase.Henry && !this.state.player.norcal &&
            <input ref="norcalIdInput" onKeyPress={this.onNorcalIdEntered}/>
          }
        </div>
      );
    }
  },
  updateTime(key) {
    var ref = window.Fbase.getRef("web/data/matches/"+key);
    ref.once("value", function(snapshot) {
      var data = snapshot.val();
      if (data) {
        var time = data.time;
        if (!time) {
          time = window.now(data.matchTime);
          if (time) {
            // var r = window.Fbase.getRef("web/data/matches/"+key);
            ref.update({
              time: time,
              matchTime: null
            })
          }
        }
        if (data && time && data.players) {
          for (var i in data.players) {
            // console.log(data.players[i],key, time)
            var r = window.Fbase.getRef("web/data/users/"+data.players[i]+"/matches/"+ key);
            r.set({time:time});
          }
        }
      }
    });
  },
  getMatches() {

    var m = [];
    if (this.state.player.matches) {
      var keys = Object.keys(this.state.player.matches);
      for (let key in this.state.player.matches) {
        if (!this.state.player.matches[key].time) {
          this.updateTime(key);
        } else {
          m.push({key:key, time:this.state.player.matches[key].time});
        }
      }
    }
    if (this.state.merges) {
      for (let i = 0; i< this.state.merges; i++) {
        if (this.state["merge"+i] && this.state["merge"+i].matches) {
          var keys = Object.keys(this.state["merge"+i].matches);
          for (let key in this.state["merge"+i].matches) {
            m.push({key:key, time:this.state["merge"+i].matches[key].time});
            // console.log(this.state["merge"+i].matches[key]);
          }
        }
      }
    }
    var result = [];
    var visited = {};
    var keys = {}
    var max = 10;
    for (let i in m) {
      let candidate = -1;
      for (let j in m) {
        if (!visited[j] && (candidate < 0 || m[j].time > m[candidate].time)) {
          candidate = j;
        }
      }
      if (max > 0) {
        result.push(
          <MatchBrief key={m[candidate].key} matchId={m[candidate].key} waitForCache={this.state.playerId == window.Fbase.authUid} showTeam={true} visible={true} onAfterLoad={this.onMatchBriefLoad} />
        );
      } else {
        return result;
        // result.push(
        // <div key={m[candidate].key}>{m[candidate].key}</div>);
      }
      max--;
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
          {this.getMatches()}
        </div>
      );
    }
    return null;
  }
});

module.exports = PlayerDetails;
