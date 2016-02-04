import React from 'react';
import PlayerSelect from './PlayerSelect';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';

export default class MatchRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {players: {}, scores: {}, message: ""};
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleMatchSubmit = this.handleMatchSubmit.bind(this);
  }

  handleScoreChange(id, value) {
    var newState = this.state;
    newState.message = id;
    newState.scores[id] = value;
    this.setState(newState);
    console.log(newState);
  }

  handleMatchSubmit() {

    if (!this.state.players.player1 ||
        !this.state.players.player2 ||
        this.state.players.player1.split(',').length != this.state.players.player2.split(',').length) {
      return;
    }
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data");

    var match = {};
    var matchId = "match:"+Date.now()+":"+this.state.players.player1;
    match[matchId] = this.state;
    var matchRef = ref.child('matches/'+matchId);
    matchRef.set(match[matchId]);

    var players = this.state.players.player1.split(',').concat(this.state.players.player2.split(','));
    for (var i in players) {
      matchRef = ref.child("users/"+players[i]+"/matches/"+matchId);
      matchRef.set(match[matchId]);
    }
  }

  handlePlayerChange(id, value) {
    // this is silly...
    var newState = this.state;
    newState.players[id] = value;
    this.setState(newState);
    console.log(newState);
  }

  render() {
    return (
      <div>
        <Notice notice={this.state.message} />
        <PlayerSelect label="players" onChange={this.handlePlayerChange} />
        <div>Score:</div>
        <ScoreSelect id="set1" onChange={this.handleScoreChange} />
        <ScoreSelect id="set2" onChange={this.handleScoreChange} />
        <ScoreSelect id="set3" onChange={this.handleScoreChange} />
        <button onClick={this.handleMatchSubmit}>Submit Score</button>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
