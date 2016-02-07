import React from 'react';
import PlayersSelect from './PlayersSelect';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';
import DatePicker from 'react-datepicker';
var moment = require('moment');
require('react-datepicker/dist/react-datepicker.css');

export default class MatchRecorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      players: {player1: window.Fbase.authUid()},
      scores: [{scores: [0,0]}, {scores: [0,0]}, {scores: [0,0]}],
      message: "",
      matchMoment: moment(),
      isLive: false
    };
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleMatchSubmit = this.handleMatchSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMatchTimeChange = this.handleMatchTimeChange.bind(this);
    this.handleLiveMatchSubmit = this.handleLiveMatchSubmit.bind(this);
  }

  handleMessageChange(value) {
    this.setState({message: this.refs.message.value });
  }
  handleScoreChange(id, value) {
    var newState = this.state;
    newState.scores[id] = value;
    this.setState(newState);
  }
  onSetComplete(error) {
    if (error) {
      console.log(error);
    }
  }
  createGuestPlayers(index) {
    if (index <= 4) {
      if (this.state.players["player"+index] && this.state.players["player"+index].slice(0, 6) == "guest:") {
        window.Fbase.createUser(this.state.players["player"+index].split(":")[1], function() {
          this.createGuestPlayers(index+1);
        }, this);
        return;
      } else {
        this.createGuestPlayers(index+1);
      }
    } else {
      window.Fbase.createMatch(this.state);
    }
  }
  handleLiveMatchSubmit() {
    if (!window.Fbase.authUid()) {
      alert("You have to login to create live match.");
      return;
    }

    if (!this.state.players.player1 || !this.state.players.player2) {
      alert("Please select players first.");
      return;
    } else if (this.state.players.player1 == this.state.players.player2) {
      alert("不可以左右互搏.");
      return;
    } else if (window.Fbase.authUid() != "facebook:539060618") {
      alert("System in beta, you can't create match yet");
      return;
    }
    this.setState({isLive: true}, function() {this.createGuestPlayers(1)}, this);
  }
  handleMatchSubmit() {
    if (!window.Fbase.authUid()) {
      alert("You have to login to submit match result.");
      return;
    }

    if (!this.state.players.player1 || !this.state.players.player2) {
      alert("Please select players first.");
      return;
    } else if (this.state.players.player1 == this.state.players.player2) {
      alert("不可以左右互搏.");
      return;
    } else if (this.state.scores.length < 1) {
      alert("Please provide match scores.");
      return;
    } else if (window.Fbase.authUid() != "facebook:539060618") {
      alert("System in beta, you can't create match yet");
      return;
    }
    this.setState({isLive: false}, function() {this.createGuestPlayers(1)}, this);
  }

  handleMatchTimeChange(date) {
    this.setState({
      matchMoment: date
    });
  }

  handlePlayerChange(id, value) {
    var newState = this.state;
    var players = value.split(",");
    if (id == "player1") {
      newState.players.player1 = players[0];
      newState.players.player3 = players[1] ? players[1] : null;
    } else {
      newState.players.player2 = players[0];
      newState.players.player4 = players[1] ? players[1] : null;
    }
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <PlayersSelect label="players" onChange={this.handlePlayerChange} />
        <div>Score:</div>
        <ScoreSelect id="0" onChange={this.handleScoreChange} />
        <ScoreSelect id="1" onChange={this.handleScoreChange} />
        <ScoreSelect id="2" onChange={this.handleScoreChange} />
        <div className="centerContainer">
          Match Date:
          <DatePicker selected={this.state.matchMoment} onChange={this.handleMatchTimeChange} />
        </div>
        <div className="centerContainer">
          <div>Note:</div>
          <textarea className="messageText"
            onChange={this.handleMessageChange}
            ref="message"
            defaultValue={this.state.message} />
        </div>
        <div className="centerContainer">
          <button className="submitButton" onClick={this.handleLiveMatchSubmit}>Live Match</button>
          <button className="submitButton" onClick={this.handleMatchSubmit}>Submit Score</button>
        </div>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
