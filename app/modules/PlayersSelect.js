import React from 'react';
import Select from 'react-select';

var PlayersSelect = React.createClass({
  displayName: 'PlayersSelect',
  propTypes: {
    label: React.PropTypes.string,
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
    ladder: React.PropTypes.object,
  },
  getInitialState () {
    return { player0: "", player1: "", player2: "", player3: ""};
  },
  handleSelectChange0 (value, values) {
    this.setState({ player0: value });
    if (this.props.onChange) {
      this.props.onChange("player0", value, this.props.line);
    }
  },
  handleSelectChange1 (value, values) {
    this.setState({ player1: value });
    if (this.props.onChange) {
      this.props.onChange("player1", value, this.props.line);
    }
  },

  handleSelectChange2 (value, values) {
    this.setState({ player2: value });
    if (this.props.onChange) {
      this.props.onChange("player2", value, this.props.line);
    }
  },
  handleSelectChange3 (value, values) {
    this.setState({ player3: value });
    if (this.props.onChange) {
      this.props.onChange("player3", value, this.props.line);
    }
  },

  loadOptions(input, callback) {
    var userRef = window.Fbase.getRef("web/data/users");
    if (!input) {
      callback(null, {options: [], complete: false});
      return;
    }
    userRef.orderByChild("displayName_").startAt(input.toLowerCase()).limitToFirst(5).once("value", function(snapshot) {
      var inputs = input.split(",");
      var ops = [];
      var current = inputs.length ? inputs[inputs.length-1] : "";
      console.log(input)
      inputs.forEach(function(input) {
        if (input.slice(0, 6) == "guest:") {
          var displayName = input.split(":")[1];
          if (input == inputs[inputs.length - 1]) {
            current = displayName;
          }
          var d = window.Caching.getDisplayName(input);
          if ( d != input && d != "loading") {
            displayName = d;
          }
          ops.push({value : "guest:"+displayName, label : displayName});
        } else if (input.split(":")[0].split("-")[0] == input) { // unchanged displayname
          ops.push({value : "guest:"+input, label : input});
        } else {
          ops.push({value : input, label : window.Caching.getDisplayName(input)})
        }
      });
      input = input.split(",").slice(-1)[0].split(":")[0];
      var object = snapshot.val();
      for (var key in object) {
        if (object[key] && object[key].displayName && !object[key].status) {
          if (current.toLowerCase() == object[key].displayName.toLowerCase()) {
            ops[inputs.length - 1].value = key;
            ops[inputs.length - 1].label = object[key].displayName;
          } else if (ops.indexOf(key) < 0) {
            var item = {};
            item.value = key;
            item.label = object[key].displayName;
            Caching.setSimplePlayer(key, object[key])
            ops.push(item);
          }
        }
      }
      callback(null, {options: ops, complete: false});
    }, function() {}, this);
  },
  getOptions(type, id) {
    var result = [<option key="none" label="select player ..." value="none"/>]
    if (type == "normal") {
      for (let i in this.props.ladder.users) {
        result.push(<option key={i} label={Caching.getDisplayName(i)} value={i}/>);
      }
    }
    return result;
  },
  onSelectChange0 (event) {
    this.setState({ player0: event.target.value });
    if (this.props.onChange) {
      this.props.onChange("player0", event.target.value, this.props.line);
    }
  },
  onSelectChange1 (event) {
    this.setState({ player1: event.target.value });
    if (this.props.onChange) {
      this.props.onChange("player1", event.target.value, this.props.line);
    }
  },
  onSelectChange2 (event) {
    this.setState({ player2: event.target.value });
    if (this.props.onChange) {
      this.props.onChange("player2", event.target.value, this.props.line);
    }
  },
  onSelectChange3 (event) {
    this.setState({ player3: event.target.value });
    if (this.props.onChange) {
      this.props.onChange("player3", event.target.value, this.props.line);
    }
  },
  getSelects() {
    console.log(this.props.ladder)
    if (this.props.ladder) {
      if (!this.props.ladder.type || this.props.ladder.type == "normal") {
        return (
          <tr>
            <td className="playerselect centerContainer">
              <span className="section">
                <select key="player0" value={this.state.player0} onChange={this.onSelectChange0}>
                  {this.getOptions(this.props.ladder.type, this.props.ladder.id)}
                </select>
              </span>
              <br/>
              <span className="section">
                <select key="player2" value={this.state.player2} onChange={this.onSelectChange2}>
                  {this.getOptions(this.props.ladder.type, this.props.ladder.id)}
                </select>
              </span>
            </td>
            <td className="divider">vs</td>
            <td className="playerselect centerContainer">
              <span className="section">
                <select key="player1" value={this.state.player1} onChange={this.onSelectChange1}>
                  {this.getOptions(this.props.ladder.type, this.props.ladder.id)}
                </select>
              </span>
              <br/>
              <span className="section">
                <select key="player3" value={this.state.player3} onChange={this.onSelectChange3}>
                  {this.getOptions(this.props.ladder.type, this.props.ladder.id)}
                </select>
              </span>
            </td>
          </tr>
        );
      }
    } else {
      return (
        <tr>
          <td className="playerselect centerContainer">
            <span className="section">
              <Select multi key="player0" value={this.state.player0} placeholder="Select player(s)" onChange={this.handleSelectChange0} asyncOptions={this.loadOptions} />
            </span>
          </td>
          <td className="divider">vs</td>
          <td className="playerselect centerContainer">
            <span className="section">
              <Select multi key="player1" value={this.state.player1} placeholder="Select player(s)" asyncOptions={this.loadOptions} onChange={this.handleSelectChange1} />
            </span>
          </td>
        </tr>
      );
    }
  },
  render () {
    return (
      <table className="wholerow">
        <tbody>
          {this.getSelects()}
        </tbody>
      </table>
    );
  }
});

module.exports = PlayersSelect;
