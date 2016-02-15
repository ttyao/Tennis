import React from 'react';
import Select from 'react-select';

var LadderSelect = React.createClass({
  displayName: 'LadderSelect',
  propTypes: {
    ladder: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    return { ladder: this.props.ladder || ""};
  },
  handleSelectChange (value, values) {
    this.setState({ ladder: value });
    this.props.onChange(value);
  },

  loadOptions(input, callback) {
    var userRef = window.Fbase.getRef("web/data/ladders");
    userRef.orderByChild("name").once("value", function(snapshot) {
      var ops = [];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key]) {
          var item = {};
          item.value = key;
          item.label = object[key].name;
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
              <Select value={this.state.ladder} placeholder="Select ladder" onChange={this.handleSelectChange} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = LadderSelect;
