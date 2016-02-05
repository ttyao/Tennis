import React from 'react';
import MatchBrief from './MatchBrief';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';
var ReactFireMixin = require('reactfire');


var MatchList = React.createClass({
  getInitialState () {
    return {matches : {}};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/matches");
    this.bindAsArray(ref, "matches");
  },
  render() {
    var matches = this.state.matches.map(function(match) {
      return (
        <MatchBrief key={match['.key']} match={match} player1={match.players.player1} player2={match.players.player2} />
      );
    });
    return <div>{ matches.reverse() }</div>;
  }
});

module.exports = MatchList;
