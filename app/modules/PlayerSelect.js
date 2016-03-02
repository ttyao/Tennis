import React from 'react';
import Select from 'react-select';

var ReactFireMixin = require('reactfire');
var TimerMixin = require('react-timer-mixin');

var PlayerSelect = React.createClass({
  displayName: 'PlayerSelect',
  propTypes: {
    playerId: React.PropTypes.string,
    onChange: React.PropTypes.func,
    player: React.PropTypes.object,
  },
  getInitialState () {
    return { player: this.props.player, playerId: this.props.playerId};
  },
  handleSelectChange (value, values) {
    this.setState({ player: value });
    this.props.onChange(value);
  },
  componentWillMount() {
    window.Fbase.getDisplayName(this.state.playerId);
    var userRef = window.Fbase.getRef("web/data/users").orderByChild("displayName_").startAt("he").limitToFirst(2);
      // this.bindAsArray(userRef, "players");
    userRef.once("value", function(snapshot) {});
  },

  mixins: [TimerMixin, ReactFireMixin],
  shouldComponentUpdate(nextProps, nextState) {

    var result = JSON.stringify(nextState) != JSON.stringify(this.state) ||
                 JSON.stringify(nextProps) != JSON.stringify(this.props)
    if (result) {
      console.log("updating player select: " + this.props.playerId, window.now().slice(10))
    }
    return result;
  },
  loadOptions(input, callback) {
    var ops = [{value: this.state.playerId, label: this.state.player.displayName}];
    for (let i in window.Fbase.displayNames) {
      if (window.Fbase.displayNames[i] != "loading" && i != this.state.playerId) {
        ops.push({
          value: i,
          label: window.Fbase.getDisplayName(i)
        });
      }
    }
    if (!input) {
      console.log("loading player select options: " + this.props.playerId, window.now().slice(10))
      this.setTimeout(function() {callback(null, {options: ops, complete: false});}, 0);
      return;
    }
    var userRef = window.Fbase.getRef("web/data/users");
    userRef.orderByChild("displayName_").startAt(input.toLowerCase()).limitToFirst(10).once("value", function(snapshot) {
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && !window.Fbase.displayNames[key] && !object[key].claimerId) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          window.Fbase.displayNames[key] = item.label;
          ops.push(item);
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },

  render () {
    console.log("rendering player select: " + this.props.playerId, window.now().slice(10))

    return (
      <table className="wholerow">
        <tbody><tr>
          <td className="playersection">
            <span className="section">
              <Select value={this.props.playerId || ""} placeholder="Select player" onChange={this.handleSelectChange} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = PlayerSelect;
