import React from 'react';
import PlayerSelect from './PlayerSelect';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';
import Timestamp from 'react-timestamp';
var ReactFireMixin = require('reactfire');

var MatchBrief = React.createClass({
  propTypes: {
    match: React.PropTypes.object,
    player1: React.PropTypes.string,
    player2: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },

  getInitialState () {
    return {player1: {}, player2:{}, scores: {}, matches : {}};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    console.log(this.props.player1 +"," + this.props.player2);
    console.log(this.props.match);
    var player1ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/"+this.props.player1);
    this.bindAsObject(player1ref, "player1");
    var player2ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/"+this.props.player2);
    this.bindAsObject(player2ref, "player2");
  },
  render() {
    var date = new Date(this.props.match.matchTime);
    return (
      <div className="matchBriefBody">
        {this.state.player1.displayName} vs {this.state.player2.displayName}
        <div>
        <Timestamp time={date.toISOString()} />
        </div>
      </div>
    );
  }
});

module.exports = MatchBrief;
