import React from 'react';
var ReactFireMixin = require('reactfire');
import { Link } from 'react-router'

var PlayerName = React.createClass({
  propTypes: {
    playerId: React.PropTypes.string,
    playerName: React.PropTypes.string,
    showNTRP: React.PropTypes.bool,
    isLink: React.PropTypes.bool,
  },

  getDefaultProps () {
    return ({
      showNTRP: false,
      isLink: true,
      format: "full"
    });
  },

  getInitialState () {
    var player = window.Caching.getSimplePlayer(this.props.playerId);
    return {player: player};
  },
  mixins: [ReactFireMixin],
  componentDidMount () {
    if (typeof(this.state.player) != "object") {
      var self = this;
      var player = window.Caching.getSimplePlayer(this.props.playerId, function(p) {
        if (self.isMounted() && typeof(self.state.player) != "object") {
          self.setState({player: p});
        }
      });
    }
  },
  getNTRP() {
    if (this.props.showNTRP) {
      var ntrp = this.state.player.ntrp;
      if (this.state.player.tdb) {
        if (this.props.format == "none") {
          return (<span>{this.state.player.tdb}</span>);
        }
        return (<span>({this.state.player.tdb})</span>);
      }
      if (ntrp) {
        if (ntrp.toString().length == 1) {
          ntrp=ntrp+".0";
        }
        if (this.props.format == "none") {
          return (<span>{ntrp}{this.state.player.ntrpType}</span>);
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
  getDisplayName() {
    if (this.props.format == "short") {
      var names = this.state.player.displayName.split(" ");
      if (names.length <= 1) {
        return this.state.player.displayName;
      } else {
        return names[0]+" "+names[names.length - 1];
      }
    } else if (this.props.format == "none") {
      return null;
    }
    return this.state.player.displayName;
  },
  getName() {
    if (this.state.player && typeof(this.state.player) == "object") {
      if (this.props.isLink) {
        return (<Link to={"/player/0/"+this.props.playerId}>{this.getDisplayName()} {this.getNTRP()}</Link>);
      } else {
        return (<span>{this.getDisplayName()} {this.getNTRP()}</span>);
      }
    } else if (this.props.playerId == 0 || this.props.playerId == "n:0") {
      return "Default"
    } else if (!this.props.playerId) {
      return null;
    } else {
      return (<img className="checkmark" src="/images/circle.gif" />);
    }
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
