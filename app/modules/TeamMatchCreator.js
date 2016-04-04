import React from 'react';
import ReactDOM from 'react-dom';

var update = require('react-addons-update');
var TimerMixin = require('react-timer-mixin');
import Modal from 'react-modal';

var appElement = document.getElementById('modal');
Modal.setAppElement(appElement);

var TeamMatchCreator = React.createClass({
  displayName: 'TeamMatchCreator',
  propTypes: {
    teams: React.PropTypes.array,
  },
  // mixins: [ReactFireMixin],
  mixins: [TimerMixin],
  getInitialState () {
    if (this.props.teams && this.props.teams[0] && this.props.teams[1]) {
      for (let i in this.props.teams[0].players) {
        Caching.getSimplePlayer(i);
      }
      for (let i in this.props.teams[1].players) {
        Caching.getSimplePlayer(i);
      }
    }
    return {
    };
  },
  checkPlayersLoading() {
    var self = this;
    for (let i in this.props.teams[0].players) {
      let p = Caching.getSimplePlayer(i);
      if (typeof(p) != 'object') {
        this.setTimeout(function() {self.checkPlayersLoading();}, 10);
        return;
      }
    }
    for (let i in this.props.teams[1].players) {
      let p = Caching.getSimplePlayer(i);
      if (typeof(p) != 'object') {
        this.setTimeout(function() {self.checkPlayersLoading();}, 10);
        return;
      }
    }
    this.setState({loaded: true});
  },
  componentDidMount() {
    this.checkPlayersLoading();
  },
  getOptions(team) {
    var result = [<option key="0" label="Default" value="0"/>]
    let added = {}
    for (let i in team.players) {
      let best = -1;
      for (let j in team.players) {
        if (!added[j] && (best == -1 || Caching.getDisplayName(best).toLowerCase() > Caching.getDisplayName(j).toLowerCase())) {
          best = j;
        }
      }
      added[best] = true;
      result.push(<option key={best} label={Caching.getNameAndRating(best)} value={best}/>);
    }
    return result;
  },
  getPlayerSelects(line, number) {
    return [
      <td className="playerselect centerContainer" key={"td1"+line+number}>
        <span className="section">
          <select key={"player0"+line+number} className="wholerow" ref={"player0"+line+number}>
            {this.getOptions(this.props.teams[0])}
          </select>
        </span>
      </td>,
      <td key={"td2"+line+number} className="divider">{number == 0 ? "vs" : ""}</td>,
      <td key={"td3"+line+number} className="playerselect centerContainer">
        <span className="section">
          <select key={"player1"+line+number} className="wholerow" ref={"player1"+line+number}>
            {this.getOptions(this.props.teams[1])}
          </select>
        </span>
      </td>
    ];
  },
  getLine(line, single) {
    if (single) {
      return [
        <tr key={"tr1"+line} style={{"textAlign": "left", "margin": "0 5px"}}><td>Line {line}:</td></tr>,
        <tr key={"tr2"+line}>{this.getPlayerSelects(line, 0)}</tr>
      ];
    } else {
      return [
        <tr key={"tr3"+line} style={{"textAlign": "left", "margin": "0 5px"}}><td>Line {line}:</td></tr>,
        <tr key={"tr4"+line}>{this.getPlayerSelects(line, 0)}</tr>,
        <tr key={"tr5"+line}>{this.getPlayerSelects(line, 1)}</tr>
      ];
    }
  },
  onConfirm() {
    var matches = [];
    console.log(this.refs)
    var players;
    for (let i = 1; i < 6; i++) {
      players = [];
      players.push(this.refs["player0"+i+"0"] ? this.refs["player0"+i+"0"].value : 0);
      players.push(this.refs["player1"+i+"0"] ? this.refs["player1"+i+"0"].value : 0);
      if (i > 2) {
        players.push(this.refs["player0"+i+"1"] ? this.refs["player0"+i+"1"].value : 0);
        players.push(this.refs["player1"+i+"1"] ? this.refs["player1"+i+"1"].value : 0);
      }
      matches.push(players)
    }
    console.log(matches)
    if (this.props.onConfirm) {
      this.props.onConfirm(matches)
    }
  },
  onCancel() {
    if (this.props.onCancel) {
      this.props.onCancel()
    }
  },
  render () {
    if (!this.state.loaded) {
      return (<div style={{height:"80vh",background:"url(/images/roundPreloader.gif) no-repeat center center"}}/>);
    }
    return (
      <div className="centerContainer">
        <h2>Lineup</h2>
        <table className="wholerow">
          <tbody>
            {this.getLine(1, true)}
            {this.getLine(2, true)}
            {this.getLine(3, false)}
            {this.getLine(4, false)}
            {this.getLine(5, false)}
            <tr style={{"textAlign": "right", "margin": "0 5px"}}>
              <td colSpan="3">
                <button className="submitButton" onClick={this.onConfirm}>Confirm</button>
                <button className="submitButton" onClick={this.onCancel}>Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = TeamMatchCreator;
