import React from 'react';
import PlayerName from './PlayerName';
import Timestamp from 'react-timestamp';
import ScoreBoard from './ScoreBoard';
import CommentsBox from './CommentsBox';
var ReactFireMixin = require('reactfire');
import Linkify from 'react-linkify';
var TimerMixin = require('react-timer-mixin');

import Modal from 'react-modal';

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);

var MatchBrief = React.createClass({
  propTypes: {
    matchId: React.PropTypes.string,
    onAfterLoad: React.PropTypes.func,
    visible: React.PropTypes.bool
  },

  getInitialState () {
    return {
      file: null
    };
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
    window.Fbase.updateMatchScores(match);
  },
  completeMatch() {
    var match = this.state.match;
    match.isLive = false;
    window.Fbase.updateMatchStatus(match);
  },
  editMatch() {
    var match = this.state.match;
    match.isLive = true;
    window.Fbase.updateMatchStatus(match);
  },
  onNewCommentClick() {
    if (!window.Fbase.authUid) {
      alert("You need to login to leave a comment.");
      return;
    }
    this.setState({showNewCommentsBox: true});
  },
  onNewCommentsBoxCloseClick() {
    this.setState({showNewCommentsBox: false});
  },

  onNewCommentsBoxSendClick() {
    window.Fbase.createComment(this.state.match, this.refs["newCommentsTextArea"].value);
    this.setState({showNewCommentsBox: false});
  },
  onCommentInputChange(event) {
    if (event.key == 'Enter' && event.target.value) {
      window.Fbase.createComment(this.state.match, event.target.value);
      this.refs["commentInput"].value = "";
    }
  },

  render() {
    if (this.state.match) {
      var match = this.state.match;
      var matchId = match['.key'];
      if (this.props.onAfterLoad) {
        this.setTimeout(function() { this.props.onAfterLoad(this.state.match['.key'], this.state.match.players);}, 0);
      }
      if (this.props.visible && this.state.match.players) {
        var date = new Date(match.matchTime);
        var winSetNum = this.getWinSetNum();
        return (
          <div className="matchBriefBody">
            { window.Fbase.isDebug() &&
              <div>{match['.key']}</div>
            }
            <div>
              <table className="wholerow">
                <tbody><tr>
                  <td className="playersection centerContainer">
                    <PlayerName winSetNum={winSetNum} key={match.players[0]} playerId={match.players[0]} />
                    <PlayerName winSetNum={winSetNum} key={match.players[2]} playerId={match.players[2]} />
                  </td>
                  <td className="scoresection">
                    <ScoreBoard scores={match.scores} onChange={this.onScoresChange} isLive={match.isLive} editable={match.creator==window.Fbase.authUid && match.isLive} />
                  </td>
                  <td className="playersection centerContainer">
                    <PlayerName winSetNum={-winSetNum} key={match.players[1]} playerId={match.players[1]} />
                    <PlayerName winSetNum={-winSetNum} key={match.players[3]} playerId={match.players[3]} />
                  </td>
                </tr></tbody>
              </table>
            </div>
            <div>
              <Linkify>{this.state.match.message}</Linkify>
              <CommentsBox isLive={match.isLive} comments={match.comments} />
              <input className="commentInput" ref="commentInput" onKeyPress={this.onCommentInputChange} />
            </div>
            <div>
              <Timestamp time={date.toISOString()} />
              <div className='floatright'>
                <Modal
                  className="Modal__Bootstrap modal-dialog"
                  closeTimeoutMS={150}
                  isOpen={this.state.showNewCommentsBox}
                  onRequestClose={this.handleModalCloseRequest}
                >
                  <div>Leave comments:</div>
                  <textarea className="newCommentsTextArea" ref="newCommentsTextArea" />
                  <button className='floatright' onClick={this.onNewCommentsBoxSendClick}>Send</button>
                  <button className='floatright' onClick={this.onNewCommentsBoxCloseClick}>Cancel</button>
                </Modal>
                { match.isLive ?
                    match.creator == window.Fbase.authUid ?
                      <button onClick={this.completeMatch} >Complete</button> :
                      match.matchTime + 24 * 3600 * 1000 < Date.now() ? "" :
                        (match.matchTime > Date.now() || match.scores[0].scores[0] + match.scores[0].scores[1] == 0) ? "大战倒计时中..." : "正在现场直播!" :
                    match.creator == window.Fbase.authUid ?
                      <button onClick={this.editMatch} >Edit</button> :
                      ""
                }
                { false && !match.isLive && <button onClick={this.onNewCommentClick}>Comment</button>}
              </div>
            </div>
          </div>
        );
      }
    }
    return null;
  }
});

module.exports = MatchBrief;
