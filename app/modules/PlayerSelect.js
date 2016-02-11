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
      callback(null, {options: ops, complete: true});
    }, function() {}, this);
  },

  render () {
    return (
      <table className="wholerow">
        <tbody><tr>
          <td className="playersection">
            <span className="section">
              <Select value={this.state.player} placeholder="Select player" onChange={this.handleSelectChange} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = PlayerSelect;
