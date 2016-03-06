import React from 'react';
import Select from 'react-select';
import PlayerName from "./PlayerName";

var TeamStats = React.createClass({
  displayName: 'LadderStats',
  propTypes: {
    team: React.PropTypes.object,
    loadedMatches: React.PropTypes.object,
  },
  getInitialState () {
    return {stats: this.props.team ? this.props.team.stats : ""};
  },
  getTeamStats() {

  },
  getStats() {
    if (this.props.team) {
      var matches = this.props.loadedMatches;
      // var matchKeys = matches ? Object.keys(matches) : [];
      var found = 0;
      // for (let i in matches) {
      //   if (parseInt(matches[i].line) > line) {
      //     line = parseInt(matches[i].line);
      //   }
      //   if (Object.keys(this.props.team.matches).indexOf(matches[i].tmId) >= 0) {
      //     found++;
      //   }
      // }
      // if (found && found == Object.keys(this.props.team.matches).length * line) {
      var stats = {};
      for (let id in this.props.team.players) {
        stats[id] = {
          id:id,
          setWin:0,
          setLoss:0,
          totalMatch:0,
          singleWin:0,
          singleLoss:0,
          doubleWin:0,
          doubleLoss:0,
          totalWin:0,
          totalLoss:0,
          totalWinRate:0
        };
      }
      for (let key in matches) {
        if (Object.keys(this.props.team.matches).indexOf(matches[key].tmId) < 0) {
          continue;
        }
        found++;
        let match = matches[key];
        if (match.status == "completed") {
          var winningSet = 0;
          for (let i in match.scores) {
            if (match.scores[i][0] > match.scores[i][1]) {
              winningSet+=1;
            } else if (match.scores[i][0] < match.scores[i][1]) {
              winningSet-=1;
            }
          }
          for (let i in match.players) {
            if (match.players[i] && stats[match.players[i]]) {
              let win = (winningSet > 0 && !(i%2) || winningSet < 0 && (i%2));
              let loss = (winningSet > 0 && (i%2) || winningSet < 0 && !(i%2));
              stats[match.players[i]].totalWin +=  win ? 1 : 0;
              stats[match.players[i]].singleWin +=  (win && match.players.length <= 2) ? 1 : 0;
              stats[match.players[i]].doubleWin +=  (win && match.players.length > 2) ? 1 : 0;
              stats[match.players[i]].totalLoss +=  loss ? 1 : 0;
              stats[match.players[i]].singleLoss +=  (loss && match.players.length <= 2) ? 1 : 0;
              stats[match.players[i]].doubleLoss +=  (loss && match.players.length > 2) ? 1 : 0;
              stats[match.players[i]].setWin -= (i%2) ? winningSet : -winningSet ;
              stats[match.players[i]].totalMatch ++;
              stats[match.players[i]].totalWinRate = Math.floor(stats[match.players[i]].totalWin / stats[match.players[i]].totalMatch * 100) +"%";
            }
          }
        }
      }
        //
      // }
      stats.found = found;
      if (!this.props.team.stats || this.props.team.stats.found <= found) {
        window.Fbase.updateTeamStats(this.props.team.id, stats);
      }
      if (this.props.team.stats && this.props.team.stats.found >= found) {
        stats = this.props.team.stats;
      }
      if (stats) {
        var result = [];
        var used = {};
        var rank=1;
        for (let i in stats) {
          if (typeof(stats[i]) == "object") {
            let best = null;
            for (let j in stats) {
              if (typeof(stats[j]) == "object" && !used[j] &&
                  (!best ||
                    (stats[j].totalWin > stats[best].totalWin ||
                    (stats[j].totalWin == stats[best].totalWin &&
                      (stats[j].totalMatch < stats[best].totalMatch ||
                        (stats[j].totalMatch == stats[best].totalMatch && stats[j].setWin > stats[best].setWin)))))) {
                best = j;
              }
            }
            used[best] = true;
            rank++;
            result.push(
              <tr key={stats[best].id} style={rank % 2 ? null : {backgroundColor:"#f8f8f8"}}>
                <td><PlayerName format="short" playerId={stats[best].id} /></td>
                <td><PlayerName format="none" showNTRP={true} isLink={false} playerId={stats[best].id} /></td>
                <td>{stats[best].singleWin}/{stats[best].singleLoss}</td>
                <td>{stats[best].doubleWin}/{stats[best].doubleLoss}</td>
                <td>{stats[best].totalWin}/{stats[best].totalLoss}</td>
                <td>{stats[best].totalWinRate}</td>
              </tr>
            );
          }
        }
        return result;
      }
    }
  },
  render () {
    if (this.props.team) {
      return (
        <div>
          <table className="wholerow rightalign shadowedBox notablespacing">
            <tbody>
              <tr className="headerRow">
                <th>Player</th>
                <th>NTRP</th>
                <th>Single</th>
                <th>Double</th>
                <th>Total</th>
                <th>Win%</th>
              </tr>
              {this.getStats()}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  }
});

module.exports = TeamStats;
