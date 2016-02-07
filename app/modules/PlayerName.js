import React from 'react';
var ReactFireMixin = require('reactfire');

var PlayerName = React.createClass({
  propTypes: {
    playerId: React.PropTypes.string,
    winSetNum: React.PropTypes.number,
  },

  getInitialState () {
    return {};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    var playerRef = window.Fbase.getRef("web/data/users/"+this.props.playerId);
    this.bindAsObject(playerRef, "player");
  },
  render() {
    var cls = "";
    if (this.props.winSetNum > 0) {
      cls = "winningPlayer";
    } else if (this.props.winSetNum < 0) {
      cls = "losingPlayer";
    }
    return (
      <div className={cls}>
        {this.state.player? this.state.player.displayName : "n/a"}
      </div>
    );
  }
});

module.exports = PlayerName;
