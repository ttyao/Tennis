import React from 'react';
import Select from 'react-select';

var LadderSelect = React.createClass({
  displayName: 'LadderSelect',
  propTypes: {
    ladder: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    var userRef = window.Fbase.getRef("web/data/ladders");
    userRef.orderByChild("name").limitToLast(5).once("value", function(snapshot) {});
    return { ladder: this.props.ladder };
  },
  handleSelectChange (value, values) {
    this.props.onChange(value);
  },
  // shouldComponentUpdate(nextProps, nextState) {
  //   return JSON.stringify(nextState) != JSON.stringify(this.state) ||
  //          JSON.stringify(nextProps) != JSON.stringify(this.props)
  // },
  loadOptions(input, callback) {
    var ops = [{value: this.props.ladder.id, label: this.props.ladder.name}];
    var keys = {};
    keys[this.props.ladder.id] = true;
    var userRef = window.Fbase.getRef("web/data/ladders");
    userRef.orderByChild("name").limitToLast(5).once("value", function(snapshot) {
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && !keys[key]) {
          var item = {};
          item.value = key;
          item.label = object[key].name;
          keys[key] = true;
          ops.push(item);
        }
      }
      callback(null, {options: ops, complete: true});
    }, function() {}, this);
  },

  render () {
    if (this.props.ladder) {
      return (
        <table className="wholerow">
          <tbody><tr>
            <td className="playersection">
              <span className="section">
                <Select value={this.props.ladder.id} placeholder="Select ladder" onChange={this.handleSelectChange} asyncOptions={this.loadOptions} />
              </span>
            </td>
          </tr></tbody>
        </table>
      );
    }
    return null;
  }
});

module.exports = LadderSelect;
