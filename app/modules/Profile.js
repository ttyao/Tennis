import React from 'react';
var ReactFireMixin = require('reactfire');

var Profile = React.createClass({
  propTypes: {
    playerId: React.PropTypes.string,
    scores: React.PropTypes.array,
    onChange: React.PropTypes.func,
    editable: React.PropTypes.bool,
    status: React.PropTypes.string,
  },

  getInitialState () {
    return {};
  },
  componentWillMount() {
  },
  render() {
    return (
      <div className="centerContainer">
        ME
      </div>
    );
  }
});

module.exports = Profile;
