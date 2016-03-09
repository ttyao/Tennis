import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import PlayerDetails from './PlayerDetails';
import LadderOverview from './LadderOverview';
import NorcalSync from "./NorcalSync";
import Profile from "./Profile";
import RatingCalculator from "./RatingCalculator"

var Dropzone = require('react-dropzone');

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
    this.onTestButtonClick = this.onTestButtonClick.bind(this);
    this.onBeforeChange = this.onBeforeChange.bind(this);
  }

  authDataCallback(authData) {
    if (!authData) {
      var ref = window.Fbase.getRef();
      ref.authWithOAuthRedirect("facebook", function (error) {
        console.log("Login Failed!", error);
      });
    }
    else {
      console.log("Authenticated successfully with payload:", authData);
    }
  }
  logout() {
    var ref = window.Fbase.getRef();
    ref.unauth();
    location.reload();
  }
  loadUsers(id) {
    var self = this;
    if (id % 100 == 0) console.log(id);
    Fbase.getRef("web/data/users/n:"+id).once("value", function(s) {
      var user = s.val();
      if (user) {
        new Firebase("https://tdb0.firebaseio.com/web/data/users/n:"+id).set(user);
        delete users.matches;
        new Firebase("https://tennismatches.firebaseio.com/web/data/users/n:"+id).set(user);
      }
      self.loadUsers(id+1);
    })
  }
  onTestButtonClick() {

  }
  onBeforeChange(index) {
    this.props.history.push("/"+index)
  }
  getTabIndex(value) {
    const tab_maps = {
      "ladder" : 1,
      "recent" : 3,
      "player" : 2,
      "profile" : 4
    }
    var index = parseInt(value);
    if (index) {
      return index;
    }
    if (tab_maps[value]) {
      return tab_maps[value];
    }
    return 2;
  }
  render() {
    window.GoogleAnalytics();
    return (
      <div className="container">
        <div className="page-header">
          <h2 className="titleText">Tennis Database</h2>
        </div>
        <Tabs tabActive={this.getTabIndex(this.props.params.tab)} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Ladder'>
            <LadderOverview ladderId={this.props.params.ladderId} {...this.props} teamId={this.props.params.playerId} />
          </Tabs.Panel>
          <Tabs.Panel title="Player">
            <PlayerDetails playerId={this.props.params.playerId} {...this.props} />
          </Tabs.Panel>
          {(window.Fbase.authUid == window.Fbase.Henry) &&
            <Tabs.Panel title="Ad">
              <button onClick={this.onTestButtonClick}>Test</button>
              <img src={this.state.file} className="player" />
              <div>from ID:<input ref="fromId"/></div>
              <div>to ID:<input ref="toId"/></div>
              <NorcalSync />
              <RatingCalculator />
              <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
            </Tabs.Panel>
          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
