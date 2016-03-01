import React from 'react';
import Select from 'react-select';

var LadderSelect = React.createClass({
  displayName: 'LadderSelect',
  propTypes: {
    ladder: React.PropTypes.object,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    // var userRef = window.Fbase.getRef("web/data/ladders/"+this.props.ladderId);
    // userRef.orderByKey().equalTo(this.props.ladderId).limitToFirst(1).once("value", function(snapshot) {});
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
    var ops = [{value: this.props.ladder.id, label: this.props.ladder.displayName}];
    var keys = {};
    keys[this.props.ladder.id] = true;
    var userRef = window.Fbase.getRef("web/data/ladders");
    if (!input) {
      input = "2016";
    }
    userRef.orderByChild("displayName_").startAt(input.toLowerCase()).limitToFirst(10).once("value", function(snapshot) {
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && !keys[key]) {
          var item = {};
          item.value = key;
          item.label = object[key].displayName;
          keys[key] = true;
          ops.push(item);
        }
      }
      callback(null, {options: ops, complete: false});
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
