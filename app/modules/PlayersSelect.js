import React from 'react';
import Select from 'react-select';

var PlayersSelect = React.createClass({
  displayName: 'PlayerSelect',
  propTypes: {
    label: React.PropTypes.string,
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    return { player0: window.Fbase.authUid, player1: ""};
  },
  handleSelectChange1 (value, values) {
    this.setState({ player0: value });
    this.props.onChange("player0", value);
  },
  handleSelectChange2 (value, values) {
    this.setState({ player1: value });
    this.props.onChange("player1", value);
  },
  toggleDisabled (e) {
    this.setState({ 'disabled': e.target.checked });
  },

  loadOptions(input, callback) {
    var userRef = window.Fbase.getRef("web/data/users");
    userRef.orderByChild("displayName").once("value", function(snapshot) {
      var inputs = input.split(",");
      var ops = [];
      var current = inputs.length ? inputs[inputs.length-1] : "";
      inputs.forEach(function(input) {
        if (input.slice(0, 6) == "guest:") {
          var displayName = input.split(":")[1];
          if (input == inputs[inputs.length - 1]) {
            current = displayName;
          }
          ops.push({value : "guest:"+displayName, label : displayName});
        } else if (input.split(":")[0].split("-")[0] == input) { // unchanged displayname
          ops.push({value : "guest:"+input, label : input});
        }
      });
      input = input.split(",").slice(-1)[0].split(":")[0];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && object[key].displayName) {
          if (current.toLowerCase() == object[key].displayName.toLowerCase()) {
            ops[inputs.length - 1].value = key;
          } else {
            var item = {};
            item.value = key;
            item.label = object[key].displayName;
            ops.push(item);
          }
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },

  render () {
    return (
      <table className="wholerow">
        <tbody><tr>
          <td className="playersection">
            <span className="section">
              <Select multi key="player0" value={this.state.player0} placeholder="Select player(s)" onChange={this.handleSelectChange0} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr>
        <tr>
          <td className="divider"> VS </td>
        </tr>
        <tr>
          <td className="playersection">
            <span className="section">
              <Select multi key="player1" value={this.state.player1} placeholder="Select player(s)" asyncOptions={this.loadOptions} onChange={this.handleSelectChange1} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = PlayersSelect;
