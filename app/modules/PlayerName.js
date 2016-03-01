import React from 'react';
var ReactFireMixin = require('reactfire');
import { Link } from 'react-router'

var PlayerName = React.createClass({
  propTypes: {
    playerId: React.PropTypes.string,
    playerName: React.PropTypes.string,
    winSetNum: React.PropTypes.number,
    status: React.PropTypes.string,
  },

  getInitialState () {
    return {};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    // if (!this.props.playerName || this.props.playerName == "loading") {
      var playerRef = window.Fbase.getRef("web/data/users/"+this.props.playerId);
      this.bindAsObject(playerRef, "player");
    // }
  },
  getNTRP() {
    var ntrp = this.state.player.ntrp;
    if (ntrp) {
      if (ntrp.toString().length == 1) {
        ntrp=ntrp+".0";
      }
      return (<span>({ntrp})</span>);
    }
  },
  getName() {
    // if (window.Fbase.isValidDisplayName(this.props.playerName) && this.props.playerName != "loading") {
    //   return (<Link to={"/player/0/"+this.props.playerId}>{this.props.playerName}</Link>);
    // } else {
      if (this.state.player) {
        return (<Link to={"/player/0/"+this.props.playerId}>{this.state.player.displayName} {this.getNTRP()}</Link>);
      } else if (!this.props.playerId) {
        return "Default"
      }
    // }
  },
  render() {
    var cls = "";
    if (this.props.status == "completed" && this.props.winSetNum > 0) {
      cls = "winningPlayer";
    } else if (this.props.status == "completed" && this.props.winSetNum < 0) {
      cls = "losingPlayer";
    }
    return (
      <div className={cls}>
        {this.getName()}
      </div>
    );
  }
});

module.exports = PlayerName;
