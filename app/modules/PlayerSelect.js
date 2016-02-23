import React from 'react';
import Select from 'react-select';

var PlayerSelect = React.createClass({
  displayName: 'PlayerSelect',
  propTypes: {
    player: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    return { player: this.props.player};
  },
  handleSelectChange (value, values) {
    this.setState({ player: value });
    this.props.onChange(value);
  },
  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextState) != JSON.stringify(this.state) ||
           JSON.stringify(nextProps) != JSON.stringify(this.props)
  },
  loadOptions(input, callback) {
    var ops = [];
    for (let i in window.Fbase.displayNames) {
      if (window.Fbase.displayNames[i] != "loading") {
        ops.push({
          value: i,
          label: window.Fbase.getDisplayName(i)
        });
      }
    }
    if (!input) {
      callback(null, {options: ops, complete: false});
      return;
    }
    var userRef = window.Fbase.getRef("web/data/users");
    userRef.orderByChild("displayName_").startAt(input.toLowerCase()).limitToFirst(15).once("value", function(snapshot) {
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && !window.Fbase.displayNames[key]) {
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
