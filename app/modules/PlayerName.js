import React from 'react';
var ReactFireMixin = require('reactfire');
import { Link } from 'react-router'

var PlayerName = React.createClass({
  propTypes: {
    playerId: React.PropTypes.string,
    playerName: React.PropTypes.string,
    showNTRP: React.PropTypes.bool,
  },

  defaultProps: {
    showNTRP: false,
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
    if (this.props.showNTRP) {
      var ntrp = this.state.player.ntrp;
      if (ntrp) {
        if (ntrp.toString().length == 1) {
          ntrp=ntrp+".0";
        }
        return (<span>({ntrp})</span>);
      }
    }
    return null;
  },
  shouldComponentUpdate(nextProps, nextState) {
    var result = JSON.stringify(nextState) != JSON.stringify(this.state) ||
                 JSON.stringify(nextProps) != JSON.stringify(this.props)
    return result;
  },
  getName() {
    // if (window.Fbase.isValidDisplayName(this.props.playerName) && this.props.playerName != "loading") {
    //   return (<Link to={"/player/0/"+this.props.playerId}>{this.props.playerName}</Link>);
    // } else {
      if (this.state.player) {
        return (<Link to={"/player/0/"+this.props.playerId}>{this.state.player.displayName} {this.getNTRP()}</Link>);
      } else if (this.props.playerId == 0) {
        return "Default"
      } else {
        return (<img className="checkmark" src="/images/circle.gif" />);
      }
    // }
  },
  render() {
    return (
      <span>
        {this.getName()}
      </span>
    );
  }
});

module.exports = PlayerName;
