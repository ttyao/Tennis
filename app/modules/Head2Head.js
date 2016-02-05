import React from 'react';
import MatchBrief from './MatchBrief';
var ReactFireMixin = require('reactfire');

var Head2Head = React.createClass({
  getInitialState () {
    return {matches : {}};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    console.log(this.props.player1);
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/"+this.props.player1+"/matches");
    this.bindAsArray(ref, "matches");
  },
  render() {
    var matches = this.state.matches.map(function(match) {
      console.log(match['.key']);
      return (
        <MatchBrief key={match['.key']} matchId={match['.key']} />
      );
    });
    return <div>{ matches.reverse() }</div>;
  }
});

module.exports = Head2Head;
