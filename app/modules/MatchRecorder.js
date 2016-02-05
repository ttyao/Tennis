import React from 'react';
import PlayerSelect from './PlayerSelect';
import ScoreSelect from './ScoreSelect';
import Notice from './Notice';

export default class MatchRecorder extends React.Component {
  constructor(props) {
    super(props);

    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");
    var authData = ref.getAuth();
    this.state = {players: {player1: authData["uid"]}, scores: [], message: ""};
    this.handlePlayerChange = this.handlePlayerChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleMatchSubmit = this.handleMatchSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
  }

  handleMessageChange(value) {
    var newState = this.state;
    newState.message = value;
    this.setState(newState);
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
  handleMatchSubmit() {
    if (!this.state.players.player1 || !this.state.players.player2) {
      alert("Please select players first.");
      return;
    } else if (this.state.players.player1 == this.state.players.player2) {
      alert("不可以左右互搏.");
      return;
    } else if (this.state.scores.length < 1) {
      alert("Please provide match scores.");
      return;
    }
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data");

    var authData = ref.getAuth();
    if (!authData) {
      alert("You have to login to submit match result.");
      return;
    }

    var match = {};
    var matchTime = Date.now();
    var matchId = "match:"+matchTime+":"+authData["uid"];
    match[matchId] = this.state;
    match[matchId]["matchTime"] = matchTime;
    match[matchId]["creator"] = authData["uid"];

    // There is no transaction support...

    for (var i in this.state.players) {
      if (this.state.players[i]) {
        matchRef = ref.child("users/"+this.state.players[i]+"/matches/"+matchId);
        matchRef.set(match[matchId], this.onSetComplete);
      }
    }

    var matchRef = ref.child('matches/'+matchId);
    matchRef.set(match[matchId], function(error) {
      if (error) {
        alert("Can't save match.");
        console.log(error);
      } else {
        location.reload();
      }
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
        <Notice notice={this.state.message} />
        <PlayerSelect label="players" onChange={this.handlePlayerChange} />
        <div>Score:</div>
        <ScoreSelect id="0" onChange={this.handleScoreChange} />
        <ScoreSelect id="1" onChange={this.handleScoreChange} />
        <ScoreSelect id="2" onChange={this.handleScoreChange} />
        <div className="centerContainer">
          <button className="submitButton" onClick={this.handleMatchSubmit}>Submit Score</button>
        </div>
      </div>
    );
  }
}

MatchRecorder.defaultProps = { frictionConfig: {} };
