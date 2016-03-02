import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import PlayerDetails from './PlayerDetails';
import LadderOverview from './LadderOverview';
import NorcalSync from "./NorcalSync";
import Profile from "./Profile";

var Dropzone = require('react-dropzone');

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
    this.onUpload = this.onUpload.bind(this);
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

  onUpload(files){
  }

  onTestButtonClick() {
    var ref = window.Fbase.getRef("web/data/matches");
    ref.once('value', function(data) {
      var d = data.val();
      for (let m in d) {
        var score = [];
        for (let s in d[m].scores) {
          score.push(d[m].scores[s].scores);
        }
        if (score) {
          var ref = window.Fbase.getRef("web/data/matches/"+m+"/scores");
          ref.set(score);
        }
      }
    })
    return;
    var obj = {ccc:1};
    window.Fbase.createObject("leagues", "", obj);
    console.log(obj)
    var data = [
    "190024;Maria E  Chamberlain;2010399900;03/31/2016;3.0;Livermore, CA;F"];
    // data.forEach(function(row){
    //   var p = row.split(";");
    //   if (true || p[4] != "na") {
    //     window.Fbase.createObject("users", "n:"+p[0],{
    //       n: p[0],
    //       displayName: p[1],
    //       usta: p[2],
    //       expirationDate: p[3],
    //       rating: p[4],
    //       residence: p[5],
    //     });
    //   }
    //   // console.log(p);
    // });

    var matches = [
   "match:2016-02-10-22-19-52-100:facebook:539060618",
   "match:2016-02-10-23-48-02-608:facebook:539060618"
    ]
    console.log("start", window.now())
    matches.forEach(function(m) {
      var ref = window.Fbase.getRef("web/data/matches/"+m);
      ref.once('value', function() {
        console.log("done",window.now())
      })
    });
    console.log("starting ", window.now());
    // var ref = window.Fbase.getRef("web/data/matches/match:1454970406422:facebook:539060618");
    var ref = window.Fbase.getRef("web/data/users/facebook:539060618");
    ref.once('value', function() {
      console.log("got data", window.now());
    })
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
    return tab_maps[value];
  }
  render() {
    console.log("menu", this.props.params, window.Fbase.authUid)
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
          {window.Fbase.authUid == window.Fbase.Henry &&
            <Tabs.Panel title="Ad">
              <Dropzone onDrop={this.onUpload} className="pictureUpload">
                <div>Try</div>
              </Dropzone>
              <button onClick={this.onTestButtonClick}>Test</button>
              <img src={this.state.file} className="player" />
              <div>from ID:<input ref="fromId"/></div>
              <div>to ID:<input ref="toId"/></div>
              <NorcalSync />
              <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
            </Tabs.Panel>
          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
