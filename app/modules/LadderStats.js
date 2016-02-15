import React from 'react';
import Select from 'react-select';

var LadderStats = React.createClass({
  displayName: 'LadderStats',
  propTypes: {
    matches: React.PropTypes.object,
  },
  getInitialState () {
    return { matches: this.props.matches || {}};
  },
  getStats() {
    if (this.state.matches) {
      var stats = {};
      console.log(this.state.matches);
      for (let key in this.state.matches) {
        let match = this.state.matches[key];
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
                totalMatch:0,
                totalWin:0,
                totalLoss:0,
                totalWinRate:0,
              };
            }
            stats[match.players[i]].totalWin += (winningSet > 0 && !(i%2) || winningSet < 0 && (i%2)) ? 1 : 0;
            stats[match.players[i]].totalLoss += (winningSet > 0 && (i%2) || winningSet < 0 && !(i%2)) ? 1 : 0;
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
          if (!stats[j].used && (!best || (stats[j].totalWin > stats[best].totalWin || (stats[j].totalWin == stats[best].totalWin && stats[j].totalMatch < stats[best].totalMatch)))) {
            best = j;
          }
        }
        stats[best].used = true;
        result.push(
          <tr>
            <td>{rank++}</td>
            <td>{window.Fbase.getDisplayName(stats[best].id)}</td>
            <td>{stats[best].totalWin}</td>
            <td>{stats[best].totalMatch}</td>
            <td>{stats[best].totalWinRate}</td>
          </tr>
        );
      }
      return result;
    } else {
      return "Calculating ...";
    }
  },
  render () {
    var stats = this.getStats();
    return (
      <div>
        <table className="wholerow rightalign">
          <tbody>
            <tr>
              <th/>
              <th>Player</th>
              <th>Win</th>
              <th>Total</th>
              <th>Win%</th>
            </tr>
            {stats}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = LadderStats;
