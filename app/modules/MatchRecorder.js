import React from 'react';
import PlayersSelect from './PlayersSelect';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';
import DatePicker from 'react-datepicker';
import LadderSelect from "./LadderSelect";
var moment = require('moment');
require('react-datepicker/dist/react-datepicker.css');

export default class MatchRecorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      players: [null, null, null, null],
      scores: [[0,0], [0,0], [0,0]],
      message: "",
      matchMoment: moment(),
      status: "completed",
      ladder: this.props.ladder || null,
    };
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleMatchSubmit = this.handleMatchSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleMatchTimeChange = this.handleMatchTimeChange.bind(this);
    this.onLadderChange = this.onLadderChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
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
      if (this.props.onMatchCreated) {
        this.props.onMatchCreated();
      }
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
    if (this.state.scores[0][0] + this.state.scores[0][1] > 0) {
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
      newState.players[0] = players[0] || null;
      if (players.length > 1) {
        newState.players[2] = players[1] || null;
      }
    } else if (id == 'player1') {
      newState.players[1] = players[0] || null;
      if (players.length > 1) {
        newState.players[3] = players[1] || null;
      }
    } else if (id == 'player2') {
      newState.players[2] = players[0] || null;
    } else if (id == 'player3') {
      newState.players[3] = players[0] || null;
    }
    this.setState(newState);
  }

  onLadderChange(id) {
    this.setState({ladder:id});
  }

  render() {
    return (
      <div>
        {this.props.showLadder && <LadderSelect value={this.state.ladder} onChange={this.onLadderChange} />}
        <PlayersSelect label="players" onChange={this.handlePlayerChange} ladder={this.props.ladder} />
        <div className="centerContainer">Score:</div>
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
          <button className="submitButton" onClick={this.handleCancel}>Cancel</button>
        </div>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
