import React from 'react';
import Select from 'react-select';

var PlayerSelect = React.createClass({
  displayName: 'PlayerSelect',
  propTypes: {
    player: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    return { player: this.props.player || ""};
  },
  handleSelectChange (value, values) {
    this.setState({ player: value });
    this.props.onChange(value);
  },

  loadOptions(input, callback) {
    if (!input) {
      var opts = [];
      if (this.props.player) {
        opts.push({
          value: this.props.player,
          label: window.Fbase.getDisplayName(this.props.player)
        });
      }
      callback(null, {options: opts, complete: false});
      return;
    }
    var userRef = window.Fbase.getRef("web/data/users");
    userRef.orderByChild("displayName").once("value", function(snapshot) {
      var ops = [];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key]) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          ops.push(item);
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
              <Select value={window.Fbase.getDisplayName(this.state.player)} placeholder="Select player" onChange={this.handleSelectChange} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = PlayerSelect;
