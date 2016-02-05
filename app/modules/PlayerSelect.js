import React from 'react';
import Select from 'react-select';

var PlayerSelect = React.createClass({
  displayName: 'PlayerSelect',
  propTypes: {
    label: React.PropTypes.string,
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
  },
  getInitialState () {
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");
    var authData = ref.getAuth();
    return { player1: authData["uid"], player2: null};
  },
  handleSelectChange1 (value, values) {
    this.setState({ player1: value });
    this.props.onChange("player1", value);
  },
  handleSelectChange2 (value, values) {
    this.setState({ player2: value });
    this.props.onChange("player2", value);
  },
  toggleDisabled (e) {
    this.setState({ 'disabled': e.target.checked });
  },

  loadOptions(input, callback) {
    var userRef = new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users");
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
              <Select multi value={this.state.player1} placeholder="Select player(s)" onChange={this.handleSelectChange1} asyncOptions={this.loadOptions} />
            </span>
          </td>
        </tr>
        <tr>
          <td className="divider"> VS </td>
        </tr>
        <tr>
          <td className="playersection">
            <span className="section">
              <Select multi value={this.state.player2} placeholder="Select player(s)" asyncOptions={this.loadOptions} onChange={this.handleSelectChange2} />
            </span>
          </td>
        </tr></tbody>
      </table>
    );
  }
});

module.exports = PlayerSelect;
