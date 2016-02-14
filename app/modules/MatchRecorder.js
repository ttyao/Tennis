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
      players: [window.Fbase.authUid, null, null, null],
      scores: [{scores: [0,0]}, {scores: [0,0]}, {scores: [0,0]}],
      message: "",
      matchMoment: moment(),
      status: "completed"
    };
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleMatchSubmit = this.handleMatchSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMatchTimeChange = this.handleMatchTimeChange.bind(this);
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
    if (index < 4) {
      if (this.state.players[index] && this.state.players[index].slice(0, 6) == "guest:") {
        window.Fbase.createUser(this.state.players[index].split(":")[1], function() {
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
  handleMatchSubmit() {
    if (!window.Fbase.authUid) {
      alert("You have to login to submit match result.");
      return;
    }

    if (!this.state.players[0] || !this.state.players[1]) {
      alert("Please select players first.");
      return;
    } else if (this.state.players[0] == this.state.players[1]) {
      alert("You cannot play against yourself.");
      return;
    }

    var status = "completed";
    console.log(this.status, this.state.scores[0].scores[0] + this.state.scores[0].scores[1], this.state.matchMoment.unix()*1000, Date.now())
    if (this.state.scores[0].scores[0] + this.state.scores[0].scores[1] > 0) {
      if (this.state.matchMoment.unix()*1000 > Date.now()) {
        alert("Date of completed match can't be in the future.");
        return;
      }
    } else if (this.state.matchMoment.unix()*1000 > Date.now()) {
      status = "pending";
    } else {
      status = "active";
    }

    this.setState({status: status}, function() {this.createGuestPlayers(0)}, this);
  }

  handleMatchTimeChange(moment) {
    this.setState({
      matchMoment: moment
    });
  }

  handlePlayerChange(id, value) {
    var newState = this.state;
    var players = value.split(",");
    if (id == "player0") {
      newState.players[0] = players[0];
      newState.players[2] = players[1] || null;
    } else {
      newState.players[1] = players[0];
      newState.players[3] = players[1] || null;
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
          <button className="submitButton" onClick={this.handleMatchSubmit}>Create Match</button>
        </div>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
