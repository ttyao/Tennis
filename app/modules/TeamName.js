import React from 'react';
var ReactFireMixin = require('reactfire');
import { Link } from 'react-router'

var TeamName = React.createClass({
  propTypes: {
    teamId: React.PropTypes.string,
    status: React.PropTypes.string,
  },

  getInitialState () {
    return {};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    if (this.props.teamId) {
      var ref = window.Fbase.getRef("web/data/teams/"+this.props.teamId);
      this.bindAsObject(ref, "team");
    } else {
      var ref = window.Fbase.getRef("web/data/ladders/"+this.props.ladderId);
      this.bindAsObject(ref, "ladder");
    }
  },
  render() {
    if (this.state.team) {
      return (
        <div>
          <Link to={"/ladder/"+this.state.team.ladderId+"/"+this.props.teamId}>{this.state.team.displayName}</Link>
        </div>
      );
    } else if (this.state.ladder) {
      return (
        <div>
          <Link to={"/ladder/"+this.props.ladderId}>{this.state.ladder.displayName}</Link>
        </div>
      );
    }
    return null;
  }
});

module.exports = TeamName;
