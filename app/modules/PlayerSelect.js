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
    return {}; //player: this.props.player, playerId: this.props.playerId};
  },
  handleSelectChange (value, values) {
    // this.setState({ player: value });
    this.props.onChange(value);
  },
  componentDidMount() {
  },

  mixins: [TimerMixin, ReactFireMixin],

  loadOptions(input, callback) {
    var ops = [];
    if (!input || input == this.props.playerId) {
      ops.push({label:"Type in name to search for player ...", value:-1})
    }
    ops.push({value: this.props.playerId, label: this.props.player.displayName});
    for (let i in window.Caching.simplePlayers) {
      if (typeof(window.Caching.simplePlayers[i]) == "object" && !window.Caching.simplePlayers[i].claimerId && i != this.props.playerId) {
        ops.push({
          value: i,
          label: window.Caching.getDisplayName(i)
        });
      }
    }
    // I don't quite understand why selecting the logged in user, the input will be non-empty...
    if (!input || input == this.props.playerId) {
      var self = this;
      this.setTimeout(function() {callback(null, {options: ops, complete: false});}, 0);
      return;
    }
    var userRef = window.Fbase.getRef("web/data/usersIndex/"+input.toLowerCase().replace(" ","_").split("").join("/")+"/users");
    userRef.limitToFirst(20).once("value", function(snapshot) {
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && typeof(window.Caching.simplePlayers[key]) != "object" && !object[key].claimerId) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          window.Caching.setSimplePlayer(key, object[key]);
          ops.push(item);
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },

  render () {
    // console.log("rendering player select: " + this.props.playerId, window.now().slice(10))
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
