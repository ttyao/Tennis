import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
import TeamName from "./TeamName";
import City from "./City"
var ReactFireMixin = require('reactfire');
var LineChart = require("react-chartjs").Line;

var PlayerDetails = React.createClass({
  getInitialState () {
    var playerId = window.Fbase.authUid || window.Fbase.Henry;
    if (this.props.playerId && parseInt(this.props.playerId) != -1) {
      playerId = window.Caching.getPlayerId(this.props.playerId);
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
    // console.log("start binding player: " + playerId, window.now().slice(10))
    var player = window.Fbase.getRef("web/data/users/"+playerId);
    var self = this;
    player.once("value", function(snapshot) {
      // console.log("retrived data for player: " + playerId, window.now().slice(10))
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
      var nextPlayerId = nextProps.playerId;
      if (!nextPlayerId) {
        nextPlayerId = window.Fbase.authUid || window.Fbase.Henry;
      }
      this.setState({playerId: nextPlayerId});
      this.unbindPlayer();
      this.bindPlayer(nextPlayerId);
    }
  },
  shouldComponentUpdate(nextProps, nextState) {
    // return JSON.stringify(nextState) != JSON.stringify(this.state) ||
    //        JSON.stringify(nextProps) != JSON.stringify(this.props)
    return true;
  },
  onMatchBriefLoad(matchId, match) {

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
    this.setState({playerId: value, showAllTeam: false});
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
          t.push({key: key, type:"ladder", date: new Date(window.Utils.getDateString(this.state.player.ladders[key].date))});
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
                t.push({key:key, type:"ladder", date:new Date(window.Utils.getDateString(this.state["merge"+i].ladders[key].date))});
                loadedKeys[key] = true;
              }
            }
          }
        }
      }
    }
    var max = 5;
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

      let style = {
        backgroundColor: "rgba(101,107,105,"+(((new Date()).getFullYear() + 1 - t[candidate].date.getFullYear()) % 10 * 0.1)+")"
      }
      if (t[candidate].type == "team") {
        result.push(<TeamName visible={result.length < max || this.state.showAllTeam} key={t[candidate].key} styles={style} teamId={t[candidate].key} />);
      } else {
        result.push(<TeamName visible={result.length < max || this.state.showAllTeam} key={t[candidate].key} styles={style} ladderId={t[candidate].key} />);
      }
      if (result.length == max && !this.state.showAllTeam) {
        result.push(<a key="showall" onClick={this.showAllTeam}>Show all ... </a>);
      }
    }
    return result;
  },
  showAllTeam(event) {
    this.setState({showAllTeam:true});
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
  getUSTAMergeSection() {
    if (!this.state.player) {
      return null;
    }
    if (this.state.player.norcal || this.state.player.merges) {
      return null;
    }
    return (
      <div>
        <div>
          Enter USTA number to load your data:
        </div>
        <input ref="norcalIdInput" onKeyPress={this.onNorcalIdEntered}/>
        <button style={{margin: "0 5px"}} onClick={this.onNorcalIdEntered}>Load</button>
      </div>
    );
  },
  getLineChart() {
    if (!this.state.player) {
      return null;
    }
    if (!this.state.player.norcal && !this.state.player.merges) {
      return null;
    }
    var labels = {};
    var startingYear = 3000;
    for (var i in this.state.player.teams) {
      var date = new Date(this.state.player.teams[i].date);
      if (!labels[date.getFullYear()]) {
        if (startingYear > date.getFullYear()) {
          startingYear = date.getFullYear();
        }
        labels[date.getFullYear()] = this.state.player.teams[i];
        labels[date.getFullYear()].teams = 0;
      } else if (this.state.player.teams[i].date < labels[date.getFullYear()].date) {
        labels[date.getFullYear()].date = this.state.player.teams[i].date;
        labels[date.getFullYear()].ntrp = this.state.player.teams[i].ntrp;
      }
      labels[date.getFullYear()].teams++;
    }
    for (let m = 0; m < this.state.merges; m++) {
      if (this.state["merge"+m]) {
        for (var i in this.state["merge"+m].teams) {
          var date = new Date(this.state["merge"+m].teams[i].date);
          if (!labels[date.getFullYear()]) {
            if (startingYear > date.getFullYear()) {
              startingYear = date.getFullYear();
            }
            labels[date.getFullYear()] = this.state["merge"+m].teams[i];
            labels[date.getFullYear()].teams = 0;
          } else if (this.state["merge"+m].teams[i].date < labels[date.getFullYear()].date) {
            labels[date.getFullYear()].date = this.state["merge"+m].teams[i].date;
            labels[date.getFullYear()].ntrp = this.state["merge"+m].teams[i].ntrp;
          }
          labels[date.getFullYear()].teams++;
        }
      }
    }
    for (var i in this.state.player.tls) {
      var date = new Date(i);
      if (!labels[date.getFullYear()]) {
        if (startingYear > date.getFullYear()) {
          startingYear = date.getFullYear();
        }
        labels[date.getFullYear()] = {};
      }
      labels[date.getFullYear()].tls = this.state.player.tls[i].ntrp;
    }
    for (let m = 0; m < this.state.merges; m++) {
      if (this.state["merge"+m]) {
        for (var i in this.state["merge"+m].tls) {
          var date = new Date(i);
          if (!labels[date.getFullYear()]) {
            if (startingYear > date.getFullYear()) {
              startingYear = date.getFullYear();
            }
            labels[date.getFullYear()] = {};
          }
          labels[date.getFullYear()].tls = this.state["merge"+m].tls[i].ntrp;
        }
      }
    }

    for (var i in this.state.player.ratings) {
      let year = parseInt(i)
      if (!labels[year]) {
        if (startingYear > year) {
          startingYear = year;
        }
        labels[year] = {};
      }
      labels[year].tdb = this.state.player.ratings[year];
    }
    for (let m = 0; m < this.state.merges; m++) {
      if (this.state["merge"+m]) {
        for (var i in this.state["merge"+m].ratings) {
          let year = parseInt(i)
          if (!labels[year]) {
            if (startingYear > year) {
              startingYear = year;
            }
            labels[year] = {};
          }
          labels[year].tdb = this.state["merge"+m].ratings[year];
        }
      }
    }

    var l = [];
    var ntrps = [];
    var tls = [];
    var teams = [];
    var tdb = [];
    while (startingYear <= new Date().getFullYear()) {
      if (labels[startingYear]) {
        let n = parseFloat(labels[startingYear].ntrp) || null;
        if (n && labels[startingYear+1] && labels[startingYear+1].ntrp) {
          n = parseFloat(labels[startingYear+1].ntrp)
        }
        ntrps.push(n);
        tls.push(parseFloat(labels[startingYear].tls) || null);
        let r = parseFloat(labels[startingYear].tdb).toFixed(2);
        if (r > 0) {
          tdb.push(r);
        } else {
          tdb.push(null);
        }
        teams.push(labels[startingYear].teams || null);
      } else {
        ntrps.push(null);
        tls.push(null);
        tdb.push(null);
        teams.push(null);
      }
      l.push(startingYear++);
    }
    let teamColor = "131,237,195";
    let ntrpColor = "151,187,205";
    let tdbColor = "220,120,160";
    let tlsColor = "120,120,120";

    if (Fbase.authUid != Fbase.Henry) {
      tls = null;
    }

    let data = {
      labels: l,
      datasets: [
        {
          label: "teams",
          fillColor: "rgba("+teamColor+",0.2)",
          strokeColor: "rgba("+teamColor+",1)",
          pointColor: "rgba("+teamColor+",1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba("+teamColor+",1)",
          data: teams
        },
        {
          label: "NTRP",
          fillColor: "rgba("+ntrpColor+",0.2)",
          strokeColor: "rgba("+ntrpColor+",1)",
          pointColor: "rgba("+ntrpColor+",1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba("+ntrpColor+",1)",
          data: ntrps
        },
        {
          label: "TLS",
          fillColor: "rgba("+tlsColor+",0.2)",
          strokeColor: "rgba("+tlsColor+",1)",
          pointColor: "rgba("+tlsColor+",1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba("+tlsColor+",1)",
          data: tls
        },
        {
          label: "TDB Rating",
          fillColor: "rgba("+tdbColor+",0.2)",
          strokeColor: "rgba("+tdbColor+",1)",
          pointColor: "rgba("+tdbColor+",1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba("+tdbColor+",1)",
          data: tdb
        },
      ]
    };
    let tlsLegend = <span style={{color:"rgba(120,120,120,1)"}}> &#x25cf; TLS </span>;

    return (
      <div>
        <LineChart
          redraw={true}
          data={data}
          options={{scaleShowVerticalLines: false}}
          width="280"
          height={160}
        />
        <div>
          <span style={{color:"rgba(151,187,205,1)"}}> &#x25cf; NTRP </span>
          {tls && tlsLegend}
          <span style={{color:"rgba(220,120,160,1)"}}> &#x25cf; TDB Rating </span>
          <span style={{color:"rgba(131,237,195,1)"}}> &#x25cf; Team played </span>
        </div>
      </div>
    );
  },
  getPlayerDetails() {
    if (this.state.player) {
      return (
        <div className="matchBriefBody">
          <table className="wholerow"><tbody>
            <tr>
              <td className="rightalign"><b>USTA:</b></td>
              {this.state.player.ntrp ?
                <td className="leftalign"><a href={"https://www.ustanorcal.com/playermatches.asp?id="+this.state.player.norcal} target="_blank">{this.getNTRP(this.state.player.ntrp)}{this.state.player.ntrpType}</a></td> :
                null
              }
              <td className="rightalign"><b>City:</b></td>
              {this.state.player.residence &&
                <td className="leftalign">{this.state.player.residence}<City city={this.state.player.residence} /></td>
              }
            </tr>
            <tr>
              <td className="rightalign topalign smallpercent"><b>Teams / Ladders:</b></td>
              <td className="leftalign tenpercent" colSpan="3">{this.getCurrentTeams()}</td>
            </tr>
            <tr>
              <td colSpan="4">
                {this.getLineChart()}
              </td>
            </tr>
          </tbody></table>
          {this.getUSTAMergeSection()}
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
          }
        }
      }
    }
    var result = [];
    var visited = {};
    var keys = {}
    var max = 20;
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
                <PlayerSelect player={this.state.player} playerId={this.state.player['.key']} onChange={this.onPlayerChange} />
              </td>
            </tr>
            <tr>
              <td className="centerContainer">
                {this.getPlayerDetails()}
              </td>
            </tr>
            </tbody>
          </table>
          {this.getMatches()}
        </div>
      );
    }
    return null;
  }
});

module.exports = PlayerDetails;
