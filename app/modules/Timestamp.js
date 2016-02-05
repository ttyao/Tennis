import React from 'react';

var Timestamp = React.createClass({
  propTypes: {
    time: React.PropTypes.string,
  },

  getInitialState () {
    return {player1: {}, player2:{}, scores: {}, matches : {}};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    console.log(this.props.player1 +"," + this.props.player2);
    console.log(this.props.match);
    var player1ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/"+this.props.player1+"/facebook");
    this.bindAsObject(player1ref, "player1");
    var player2ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/"+this.props.player2+"/facebook");
    this.bindAsObject(player2ref, "player2");
  },
  render() {
    return (
      <div className="matchBriefBody">
        {this.state.player1.displayName} vs {this.state.player2.displayName}
        <div>
        <Timestamp time={this.props.match.matchTime} /> {this.props.match.matchTime}
        </div>
      </div>
    );
  }
});

module.exports = Timstamp;
