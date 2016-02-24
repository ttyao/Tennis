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
    userRef.orderByChild("name").once("value", function(snapshot) {});
    return { ladder: this.props.ladder };
  },
  // componentDidMount() {
  //   console.log(this.state.ladder, this.state.ladderId)
  //   if (!this.state.ladder && this.state.ladderId) {
  //     var ref = window.Fbase.getRef("web/data/ladders/"+this.props.ladderId);
  //     var self = this;
  //     ref.once('value', function(snapshot) {
  //       self.setState({ladder: snapshot.val()});
  //     });
  //   }
  // },
  handleSelectChange (value, values) {
    this.props.onChange(value);
  },
  // shouldComponentUpdate(nextProps, nextState) {
  //   return JSON.stringify(nextState) != JSON.stringify(this.state) ||
  //          JSON.stringify(nextProps) != JSON.stringify(this.props)
  // },
  loadOptions(input, callback) {
    var ops = [{value: this.props.ladder.id, label: this.props.ladder.name}];
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
