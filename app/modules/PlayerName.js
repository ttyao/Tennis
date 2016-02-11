import React from 'react';
var ReactFireMixin = require('reactfire');

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
    if (!this.props.playerName) {
      var playerRef = window.Fbase.getRef("web/data/users/"+this.props.playerId);
      this.bindAsObject(playerRef, "player");
    }
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
        {window.Fbase.isValidDisplayName(this.props.playerName) ?
          this.props.playerName :
          this.state.player? this.state.player.displayName : "n/a"}
      </div>
    );
  }
});

module.exports = PlayerName;
