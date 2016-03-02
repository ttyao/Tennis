import React from 'react';
import Select from 'react-select';
import PlayerName from "./PlayerName";

var LadderStats = React.createClass({
  displayName: 'LadderStats',
  propTypes: {
    ladder: React.PropTypes.object,
    team: React.PropTypes.object,
    loadedMatches: React.PropTypes.object,
  },
  getInitialState () {
    return {stats: this.props.team ? this.props.team.stats : (this.props.ladder ? this.props.ladder.stats : "")};
  },
  getTeamStats() {

  },
  getStats() {
    if (this.props.team) {
      return this.getTeamStats();
    } else {
      var matches = this.props.loadedMatches;
      var matchKeys = matches ? Object.keys(matches) : [];
      var stats = this.props.ladder.stats;
      var found = 0;
      for (let i in matchKeys) {
        if (Object.keys(this.props.ladder.matches).indexOf(matchKeys[i]) >= 0) {
          found++;
        }
      }
      if (found && found == Object.keys(this.props.ladder.matches).length) {
        stats = {};
        for (let key in matches) {
          if (Object.keys(this.props.ladder.matches).indexOf(key) < 0) {
            continue;
          }
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
              if (match.players[i] && !stats[match.players[i]]) {
                stats[match.players[i]] = {
                  id:match.players[i],
                  singleWin:0,
                  singleLoss:0,
                  singleWinRate:0,
                  doubleWin:0,
                  doubleLoss:0,
                  douleWinRate:0,
                  setWin:0,
                  setLoss:0,
                  totalMatch:0,
                  totalWin:0,
                  totalLoss:0,
                  totalWinRate:0,
                };
              }
              stats[match.players[i]].totalWin += (winningSet > 0 && !(i%2) || winningSet < 0 && (i%2)) ? 1 : 0;
              stats[match.players[i]].totalLoss += (winningSet > 0 && (i%2) || winningSet < 0 && !(i%2)) ? 1 : 0;
              stats[match.players[i]].setWin -= (i%2) ? winningSet : -winningSet ;
              stats[match.players[i]].totalMatch ++;
              stats[match.players[i]].totalWinRate = Math.floor(stats[match.players[i]].totalWin / stats[match.players[i]].totalMatch * 100) +"%";
            }
          }
        }
        window.Fbase.updateLadderStats(this.props.ladder.id, stats);
      }
      if (stats) {
        var result = [];
        var used = {};
        var rank=1;
        for (let i in stats) {
          let best = null;
          for (let j in stats) {
            if (!used[j] &&
                (!best ||
                  (stats[j].totalWin > stats[best].totalWin ||
                  (stats[j].totalWin == stats[best].totalWin &&
                    (stats[j].totalMatch < stats[best].totalMatch ||
                      (stats[j].totalMatch == stats[best].totalMatch && stats[j].setWin > stats[best].setWin)))))) {
              best = j;
            }
          }
          used[best] = true;
          result.push(
            <tr key={stats[best].id}>
              <td>{rank++}</td>
              <td><PlayerName playerId={stats[best].id} /></td>
              <td>{stats[best].totalWin}</td>
              <td>{stats[best].totalMatch}</td>
              <td>{stats[best].setWin}</td>
              <td>{stats[best].totalWinRate}</td>
            </tr>
          );
        }
        return result;
      } else {
        // return (<tr><td></td><td><div>Loading ... ({found} / {Object.keys(this.props.ladder.matches).length})</div></td></tr>);
      }
    }
  },
  render () {
    if (!this.props.ladder) {
      return null;
    }
    if (this.props.ladder.type != "normal") {
      return null; //todo
    }
    if (this.props.team) {
      return null;
    }
    return (
      <div>
        <table className="wholerow rightalign shadowedBox">
          <tbody>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Win</th>
              <th>Total</th>
              <th>SetWin</th>
              <th>Win%</th>
            </tr>
            {this.getStats()}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = LadderStats;
