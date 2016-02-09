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
    var ref = window.Fbase.getRef("web/data/matches").limitToLast(5);
    this.bindAsArray(ref, "matches");
  },
  render() {
    var matches = this.state.matches.map(function(match) {
      // console.log(match.scores);
      return (
        <MatchBrief visible={true} key={match['.key']} matchId={match['.key']} />
      );
    });
    return <div>{ matches.reverse() }</div>;
  }
});

module.exports = MatchList;
