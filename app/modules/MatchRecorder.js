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
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data");
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
        <form onSubmit={this.handleMatchSubmit}>
          <button>Submit Score</button>
        </form>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
