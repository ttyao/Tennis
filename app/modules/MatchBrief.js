import React from 'react';
import PlayerName from './PlayerName';
import Timestamp from 'react-timestamp';
var ReactFireMixin = require('reactfire');

var MatchBrief = React.createClass({
  propTypes: {
    matchId: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },

  getInitialState () {
    return {};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/matches/"+this.props.matchId);
    this.bindAsObject(ref, "match");
  },
  getWinSetNum() {
    var winningSet = 0;
    for (var i in this.state.match.scores) {
      if (this.state.match.scores[i].scores[0] > this.state.match.scores[i].scores[1]) {
        winningSet+=1;
      } else {
        winningSet-=1;
      }
    }
    return winningSet;
  },
  getScore() {
    var index = 0;
    return this.state.match.scores.map(function(score) {
      index+=1;
      return <span key={index} className="scoreSpan">{score.scores[0]}:{score.scores[1]}</span>;
    });
  },
  render() {
    if (this.state.match) {
      var date = new Date(this.state.match.matchTime);
      var winSetNum = this.getWinSetNum();
      return (
        <div className="matchBriefBody">
          <div>
            <table>
              <tbody><tr>
                <td>
                  <PlayerName winSetNum={winSetNum} key={this.state.match.players.player1} playerId={this.state.match.players.player1} />
                  <PlayerName winSetNum={winSetNum} key={this.state.match.players.player3} playerId={this.state.match.players.player3} />
                </td>
                <td>VS</td>
                <td>
                  <PlayerName winSetNum={-winSetNum} key={this.state.match.players.player2} playerId={this.state.match.players.player2} />
                  <PlayerName winSetNum={-winSetNum} key={this.state.match.players.player4} playerId={this.state.match.players.player4} />
                </td>
              </tr></tbody>
            </table>
          </div>
          <div>
            {this.getScore()}
          </div>
          <Timestamp time={date.toISOString()} />
        </div>
      );
    } else {
      return (<div/>);
    }
  }
});

module.exports = MatchBrief;
