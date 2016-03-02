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
  componentWillMount() {
    // if (window.Fbase.authUid) {
    //   var player = window.Fbase.getRef("web/data/users/"+window.Fbase.authUid);
    //   var self = this;
    //   player.once("value", function(snapshot) {
    //     // console.log("retrived data for player: " + playerId, window.now().slice(10))
    //     var data = snapshot.val();
    //     if (data) {
    //       self.bindAsObject(player, "player");
    //       if (data.merges) {
    //         var index = 0;
    //         for (let i in data.merges) {
    //           var ref = window.Fbase.getRef("web/data/users/"+i);
    //           self.bindAsObject(ref, "merge"+index);
    //           index++;
    //         }
    //         self.setState({merges: Object.keys(data.merges).length})
    //       } else {
    //         self.setState({merges: null})
    //       }
    //     }
    //   })
    // }
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

  // getUserTeams() {
  //   var t = [];
  //   var loadedKeys = {};
  //   if (this.state.player.teams) {
  //     var keys = Object.keys(this.state.player.teams);
  //     for (let key in this.state.player.teams) {
  //       if (!loadedKeys[key]) {
  //         t.push({key: key, type:"team", date: new Date(this.state.player.teams[key].date)});
  //         loadedKeys[key] = true;
  //       }
  //     }
  //   }
  //   if (this.state.player.ladders) {
  //     var keys = Object.keys(this.state.player.ladders);
  //     for (let key in this.state.player.ladders) {
  //       if (!loadedKeys[key]) {
  //         t.push({key: key, type:"ladder", date: new Date(this.state.player.ladders[key].date)});
  //         loadedKeys[key] = true;
  //       }
  //     }
  //   }
  //   if (this.state.merges) {
  //     for (let i = 0; i< this.state.merges; i++) {
  //       if (this.state["merge"+i]) {
  //         if (this.state["merge"+i].teams) {
  //           var keys = Object.keys(this.state["merge"+i].teams);
  //           for (let key in this.state["merge"+i].teams) {
  //             if (!loadedKeys[key]) {
  //               t.push({key:key, type:"team", date:new Date(this.state["merge"+i].teams[key].date)});
  //               loadedKeys[key] = true;
  //             }
  //           }
  //         }
  //         if (this.state["merge"+i].ladders) {
  //           var keys = Object.keys(this.state["merge"+i].ladders);
  //           for (let key in this.state["merge"+i].ladders) {
  //             if (!loadedKeys[key]) {
  //               t.push({key:key, type:"ladder", date:new Date(this.state["merge"+i].ladders[key].date)});
  //               loadedKeys[key] = true;
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   var visited = {};
  //   var result = []
  //   for (let i in t) {
  //     let candidate = -1;
  //     for (let j in t) {
  //       if (!visited[j] && (candidate < 0 || t[candidate].date < t[j].date)) {
  //         candidate = j;
  //       }
  //     }
  //     visited[candidate] = true;
  //     if (t[candidate].type == "team") {
  //       result.push({item:t[candidate].key, teamId={t[candidate].key} />);
  //     } else {
  //       result.push(<TeamName key={t[candidate].key} ladderId={t[candidate].key} />);
  //     }
  //     if (result.length > 4) {
  //       return result;
  //     }
  //   }
  //   return result;
  // },

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
