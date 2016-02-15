import React from 'react';
import Select from 'react-select';

var LadderStats = React.createClass({
  displayName: 'LadderStats',
  propTypes: {
    matches: React.PropTypes.object,
    matchIds: React.PropTypes.array,
  },
  getInitialState () {
    return {};
  },
  getStats() {
    var matches = this.props.matches;
    var matchKeys = Object.keys(matches);
    var found = 0;
    for (let i in matchKeys) {
      if (this.props.matchIds.indexOf(matchKeys[i]) >= 0) {
        found++;
      }
    }
    if (found == this.props.matchIds.length) {
      var stats = {};
      for (let key in matches) {
        if (this.props.matchIds.indexOf(key) < 0) {
          continue;
        }
        let match = matches[key];
        if (match.status == "completed") {
          var winningSet = 0;
          for (let i in match.scores) {
            if (match.scores[i].scores[0] > match.scores[i].scores[1]) {
              winningSet+=1;
            } else if (match.scores[i].scores[0] < match.scores[i].scores[1]) {
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
      var result = [];
      var rank=1;
      for (let i in stats) {
        let best = null;
        for (let j in stats) {
          if (!stats[j].used &&
              (!best ||
                (stats[j].totalWin > stats[best].totalWin ||
                (stats[j].totalWin == stats[best].totalWin &&
                  (stats[j].totalMatch < stats[best].totalMatch ||
                    (stats[j].totalMatch == stats[best].totalMatch && stats[j].setWin > stats[best].setWin)))))) {
            best = j;
          }
        }
        stats[best].used = true;
        result.push(
          <tr key={stats[best].id}>
            <td>{rank++}</td>
            <td>{window.Fbase.getDisplayName(stats[best].id)}</td>
            <td>{stats[best].totalWin}</td>
            <td>{stats[best].totalMatch}</td>
            <td>{stats[best].setWin}</td>
            <td>{stats[best].totalWinRate}</td>
          </tr>
        );
      }
      return result;
    } else {
      return (<tr><td></td><td><div>Calculating ... ({found} / {this.props.matchIds.length})</div></td></tr>);
    }
  },
  render () {
    return (
      <div>
        <table className="wholerow rightalign">
          <tbody>
            <tr>
              <th/>
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
