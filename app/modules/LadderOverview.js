import React from 'react';
import Select from 'react-select';
import LadderSelect from './LadderSelect';
import LadderStats from './LadderStats';
import MatchBrief from './MatchBrief';

// var ReactFireMixin = require('reactfire');

var LadderOverview = React.createClass({
  displayName: 'LadderOverview',
  propTypes: {
    ladder: React.PropTypes.string,
  },
  // mixins: [ReactFireMixin],
  getInitialState () {
    return { ladder: this.props.ladder || "ladder:2016-02-11-08-28-55-181:facebook:539060618", matches: {}, loadedMatches:{}};
  },
  componentWillMount() {
    var ref = window.Fbase.getRef("web/data/ladders/"+this.state.ladder+"/matches");
    var self = this;
    ref.once('value', function(snapshot) {
      self.setState({matches:snapshot.val()});
    });
  },
  onLadderChange(value) {
    this.setState({
      ladder: value,
      loadedMatches: {}
    });
    var ref = window.Fbase.getRef("web/data/ladders/"+value+"/matches");
    var self = this;
    ref.once('value', function(snapshot) {
      self.setState({
        matches:snapshot.val(),
      });
    });
  },
  onMatchBriefLoad(matchId, match) {
    if (this.state.matches[matchId]) {
      var matches = this.state.loadedMatches;
      if (!matches[matchId]) {
        matches[matchId] = match;
        this.setState({loadedMatches:matches});
      }
    } else {
      this.setState({loadedMatches: {}});
    }
  },
  getMatchList() {
    if (this.state.matches) {
      var result = [];
      for (let matchId in this.state.matches) {
        result.push(
          <MatchBrief key={matchId} matchId={matchId} visible={true} onAfterLoad={this.onMatchBriefLoad} />);
      }
      return (<div>{result.reverse()}</div>);
    }
  },
  render () {
    return (
      <div>
        <table className="wholerow">
          <tbody><tr>
            <td className="playersection">
              <span className="section">
                <LadderSelect ladder={this.state.ladder} onChange={this.onLadderChange} />
                <LadderStats matches={this.state.loadedMatches} matchIds={Object.keys(this.state.matches)} />
              </span>

            </td>
          </tr></tbody>
        </table>
        {this.getMatchList()}
      </div>
    );
  }
});

module.exports = LadderOverview;
