import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchList from './MatchList';
import PlayerDetails from './PlayerDetails';
import LadderOverview from './LadderOverview';
import NorcalSync from "./NorcalSync";
import Profile from "./Profile";
import RatingCalculator from "./RatingCalculator"
import Login from "./Login"
import Help from "./Help"

var Dropzone = require('react-dropzone');

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {visits: 0};
    this.onTestButtonClick = this.onTestButtonClick.bind(this);
    this.onBeforeChange = this.onBeforeChange.bind(this);
  }

  logout() {
    var ref = window.Fbase.getRef();
    ref.unauth();
    location.reload();
  }
  loadUsers(id) {
    var self = this;
    if (id % 100 == 0) console.log(id);
    new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/n:"+id).once("value", function(s) {
      var user = s.val();
      if (user) {
        Fbase.getRef("web/data/users/n:"+id).set(user);
        // delete users.matches;
        new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/n:"+id+"/teams").remove();
        new Firebase("https://blistering-torch-8342.firebaseio.com/web/data/users/n:"+id+"/matches").remove(function() {
          self.loadUsers(id+1);
        });
      } else {
        self.loadUsers(id+1);
      }
    })
  }
  onTestButtonClick() {
    this.loadUsers(1);
  }
  onBeforeChange(index) {
    this.props.history.push("/"+index)
  }
  getTabIndex(value) {
    const tab_maps = {
      "ladder" : 1,
      "help" : 3,
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
  shouldComponentUpdate(nextProps, nextState) {
    var ret = JSON.stringify(nextProps) != JSON.stringify(this.props)
    if (ret) {
      if (this.state.visits < 10) {
        this.setState({visits: this.state.visits + 1})
      }
    }
    return ret;
  }
  render() {
    window.GoogleAnalytics();
    var path = this.getTabIndex(this.props.params.tab);
    if (this.props.params.ladderId) {
      path += '-'+this.props.params.ladderId
    }
    if (this.props.params.playerId) {
      path += '-'+this.props.params.playerId
    }
    Fbase.log(path, 'visit')
    return (
      <div className="container">
        <div className="page-header">
          <Login {...this.props} visits={this.state.visits} />
          <h2 className="titleText">Tennis Database</h2>
        </div>
        <Tabs tabActive={this.getTabIndex(this.props.params.tab)} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Ladder'>
            <LadderOverview ladderId={this.props.params.ladderId} {...this.props} teamId={this.props.params.playerId} />
          </Tabs.Panel>
          <Tabs.Panel title="Player">
            <PlayerDetails playerId={this.props.params.playerId} {...this.props} />
          </Tabs.Panel>
          <Tabs.Panel title="Help">
            <Help {...this.props} />
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
