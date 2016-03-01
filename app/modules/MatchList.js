import React from 'react';
import MatchBrief from './MatchBrief';
var ReactFireMixin = require('reactfire');


var MatchList = React.createClass({
  getInitialState () {
    return {matches : {}};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    var ref = window.Fbase.getRef("web/data/matches").limitToLast(10);
    this.bindAsArray(ref, "matches");
  },
  render() {
    if (this.state.matches) {
      var matches = this.state.matches.map(function(match) {
        return (
          <MatchBrief visible={true} key={match['.key']} showTeam={true} matchId={match['.key']} />
        );
      });
      return <div>{ matches.reverse() }</div>;
    } else {
      return (<div>Loading...</div>);
    }
  }
});

module.exports = MatchList;
