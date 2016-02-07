import React from 'react';
import PlayerName from './PlayerName';
import Timestamp from 'react-timestamp';
import ScoreBoard from './ScoreBoard';
var ReactFireMixin = require('reactfire');
var TimerMixin = require('react-timer-mixin');


var MatchBrief = React.createClass({
  propTypes: {
    matchId: React.PropTypes.string,
    onAfterLoad: React.PropTypes.func,
    visible: React.PropTypes.bool
  },

  getInitialState () {
    return {};
  },
  getDefaultProps () {
    return {
      visible: true
    };
  },
  mixins: [ReactFireMixin, TimerMixin],

  componentWillMount () {
    var ref = window.Fbase.getRef("web/data/matches/"+this.props.matchId);
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
  onScoresChange(event, index) {
    var match = this.state.match;
    match.scores[Math.floor(index/2)].scores[index%2] = event.target.value;
    this.setState({match:match});
    window.Fbase.updateMatch(match);
  },
  completeMatch() {
    var match = this.state.match;
    match.isLive = false;
    this.setState({match:match});
    window.Fbase.updateMatch(match);
  },
  render() {
    if (this.state.match) {
      var match = this.state.match;
      if (this.props.onAfterLoad) {
        this.setTimeout(function() { this.props.onAfterLoad(this.state.match['.key'], this.state.match.players);}, 0);
      }
      if (this.props.visible && this.state.match.players) {
        var date = new Date(this.state.match.matchTime);
        var winSetNum = this.getWinSetNum();
        return (
          <div className="matchBriefBody">
            <div>
              <table className="wholerow">
                <tbody><tr>
                  <td className="playersection centerContainer">
                    <PlayerName winSetNum={winSetNum} key={this.state.match.players.player1} playerId={this.state.match.players.player1} />
                    <PlayerName winSetNum={winSetNum} key={this.state.match.players.player3} playerId={this.state.match.players.player3} />
                  </td>
                  <td className="scoresection">
                    <ScoreBoard scores={this.state.match.scores} onChange={this.onScoresChange} editable={this.state.match.creator==window.Fbase.authUid() && this.state.match.isLive} />
                  </td>
                  <td className="playersection centerContainer">
                    <PlayerName winSetNum={-winSetNum} key={this.state.match.players.player2} playerId={this.state.match.players.player2} />
                    <PlayerName winSetNum={-winSetNum} key={this.state.match.players.player4} playerId={this.state.match.players.player4} />
                  </td>
                </tr></tbody>
              </table>
            </div>
            <div>
            <div>
              {this.state.match.message}
            </div>
            </div>
            <div>
              <Timestamp time={date.toISOString()} />
              <div className='floatright'>
                { match.isLive ?
                    match.creator == window.Fbase.authUid() ?
                      <button onClick={this.completeMatch} >Complete</button> :
                      "正在现场直播!" :
                    ''
                }
              </div>
            </div>
          </div>
        );
      }
    }
    return (<div/>);
  }
});

module.exports = MatchBrief;
