import React from 'react';
import MatchBrief from './MatchBrief';
import PlayerSelect from './PlayerSelect';
var ReactFireMixin = require('reactfire');

var Head2Head = React.createClass({
  getInitialState () {
    var player0 = window.Fbase.authUid || window.Fbase.Henry;
    if (this.props.player0) {
      player0 = window.Caching.getPlayerId(this.props.player0);
    }
    return {
      player0: player0, player1: this.props.player1 ? window.Caching.getPlayerId(this.props.player1) : "", win1: 0, win2: 0};
  },
  mixins: [ReactFireMixin],
  componentWillMount () {
    if (this.state.player0) {
      var ref = window.Fbase.getRef("web/data/users/"+this.state.player0+"/matches");
      this.bindAsArray(ref, "matches");
    }
    console.log(this.props)
  },
  onMatchBriefLoad(matchId, match) {
    var players = match.players;
    var qualified = false;

    if (!this.state.player1 || !this.state.player0) {
      return;
    }

    if (!players) {
      console.log("players not found "+matchId);
    } else if (this.state.player0 == players[0] || this.state.player0 == players[2]) {
      qualified = (this.state.player1 == players[1] || this.state.player1 == players[3]);
    } else if (this.state.player0 == players[1] || this.state.player0 == players[3]) {
      qualified = (this.state.player1 == players[0] || this.state.player1 == players[2]);
    }

    if (this.state["qualified"+matchId] != qualified) {
      var newState = {};
      newState["qualified"+matchId] = qualified;
      // this.setState(newState);
      this.calculateWinLoss();
    }
  },
  calculateWinLoss() {
    var matchWin = 0;
    var totalMatch = 0;
    var player0 = this.state.player0;
    var player1 = this.state.player1;
    this.state.matches.forEach(function(match) {
      var setWin = 0;
      var qualified = false;
      if (match.players) {
        if (player0 == match.players[0] || player0 == match.players[2]) {
          qualified = (player1 == match.players[1] || player1 == match.players[3]);
        } else if (player0 == match.players[1] || player0 == match.players[3]) {
          qualified = (player1 == match.players[0] || player1 == match.players[2]);
        }
        if (qualified) {
          totalMatch++;
          match.scores.forEach(function(set){
            if (set[0] > set[1]) {
              setWin++;
            } else {
              setWin--;
            }
          });
          if (setWin >= 0 && (player0 == match.players[0] || player0 == match.players[2] ) ||
              setWin <= 0 && (player0 == match.players[1] || player0 == match.players[3] )) {
            matchWin++;
          }
        }
      }
    });
    this.setState({
      win1: matchWin,
      win2: totalMatch - matchWin
    });
  },
  componentWillUpdate(nextProps, nextState) {
    console.log(nextProps.player0, nextState.player0, this.props.player0, this.state.player0)
    // if (nextProps.player0)
  },
  onPlayer0Change(value){
    window.Fbase.log("head2head 1st player changed to: " + value, "query");
    this.setState({player0: value});
    var ref = window.Fbase.getRef("web/data/users/"+value+"/matches");
    // var self = this;
    this.unbind("matches");
    this.bindAsArray(ref, "matches");
    // ref.once('value', function(snapshot) {
    //   self.setState({matches:snapshot.val()});
    // })

    this.props.history.push("/player/0/"+value)
  },
  onPlayer1Change(value){
    window.Fbase.log("head2head 2nd player changed to: " + value, "query");
    this.setState({player1: value});
    var ref = window.Fbase.getRef("web/data/users/"+value+"/matches");
    this.unbind("matches");
    this.bindAsArray(ref, "matches");
  },

  render() {
    var matches = [];
    if (this.state.matches) {
      // console.log("loading matches ",this.state.matches, window.now())
      // var m = this.state.matches;
      // for (var key in m) {
      //   if (true || key == "match:1455075662000:facebook:539060618") {
      //     var ref = window.Fbase.getRef("web/data/matches/"+key);
      //     console.log("loading match ",key, window.now())
      //     ref.once('value', function(data) {
      //       console.log("got data", window.now())
      //     });
      //   }
      //   // matches.push(<MatchBrief key={key} matchId={key} visible={this.state["qualified"+key]} onAfterLoad={this.onMatchBriefLoad} />)
      // }
      matches = this.state.matches.map(function(match) {
        // var ref = window.Fbase.getRef("web/data/matches/"+match['.key']);
        // // this.bindAsObject(ref, "match");

        // if (match['.key'] == "match:1455075662000:facebook:539060618") {
        //   ref.once('value', function(data) {
        //     console.log("got data", window.now())
        //   });
        // }
        return (
          <MatchBrief key={match['.key']} matchId={match['.key']} visible={this.state["qualified"+[match['.key']]]} onAfterLoad={this.onMatchBriefLoad} />
        );
      }, this);
    }
    return (
      <div>
        <table className="wholerow">
          <tbody><tr>
            <td>
              <PlayerSelect key="player0" player={this.state.player0} onChange={this.onPlayer0Change} />
            </td>
            <td>
              <PlayerSelect key="player1" player={this.state.player1} onChange={this.onPlayer1Change} />
            </td>
          </tr><tr>
            <td className="centerContainer"> {this.state.win1} </td>
            <td className="centerContainer"> {this.state.win2} </td>
          </tr></tbody>
        </table>
        { this.state.matches ? matches.reverse() : "loading..."}
      </div>
    );
  }
});

module.exports = Head2Head;
