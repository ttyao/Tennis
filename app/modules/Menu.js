import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import PlayerDetails from './PlayerDetails';
import LadderOverview from './LadderOverview';
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

  loadPlayers(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
      // console.log(this.result);

      // By lines
      var lines = this.result.split('\n');
      for(var line = 0; line < lines.length; line++){
        var field = lines[line].split(";");
        if (!field[1]) continue;
        var player = {
          norcal: field[0],
          displayName: field[1],
          displayName_: field[1].toLowerCase(),
          usta: field[2],
          expiration: field[3],
          ntrp: parseFloat(field[4]) > 0 ? parseFloat(field[4]) : null,
          residence: field[5],
          gender: field.length > 5 && field[6].length > 0 ? field[6][0] : "U"
        };
        if (line % 100 == 0) {
          console.log(line);

        }
        if (player.ntrp) {
           // console.log(lines[line])
          var ref = window.Fbase.getRef("web/data/users/norcal:"+field[0]);
          ref.set(player);
        }
      }
    };
    reader.readAsText(file);
  }
  onUpload(files){
    this.loadPlayers(files[0])
  }

  copy(norcal) {
    // if (norcal == 10) return;
    if (norcal % 100 == 0) {
      console.log(norcal)
    }
    var self = this;
    var ref = window.Fbase.getRef("web/data/users");
    ref.orderByKey().startAt("norcal:"+norcal+"-").limitToFirst(1).once('value', function(snapshot) {
      var oldUser = snapshot.val();
      if (!oldUser || Object.keys(oldUser)[0].indexOf("norcal:"+norcal+"-") < 0) {
        self.copy(norcal+1)
      } else {
        var nref = window.Fbase.getRef("web/data/users/norcal:"+norcal);
        nref.set(oldUser[Object.keys(oldUser)[0]], function() {
          self.delete(norcal);
        })
      }
    });
  }
  delete(norcal) {
    var ref = window.Fbase.getRef("web/data/users");
    var self = this;
    ref.orderByKey().startAt("norcal:"+norcal+"-").limitToFirst(1).once('value', function(snapshot) {
      var oldUser = snapshot.val();
      if (!oldUser || Object.keys(oldUser)[0].indexOf("norcal:"+norcal+"-") < 0) {
        console.log("not found ", norcal)
        return;
      } else {
        var r = window.Fbase.getRef("web/data/users/"+Object.keys(oldUser)[0]);
        r.remove(function() {
          self.copy(norcal+1)
        })
      }
    });
  }
  onTestButtonClick() {
    this.copy(27200);
    this.copy(37200);
    this.copy(47200);
    this.copy(57200);
    this.copy(67200);
    this.copy(77200);
    this.copy(87200);
    this.copy(97200);
    this.copy(107200);
    this.copy(117200);
    this.copy(127200);
    this.copy(137200);
    this.copy(147200);
    this.copy(157200);
    this.copy(167200);
    this.copy(177200);
    this.copy(187200);
    this.copy(197200);
    this.copy(207200);
    this.copy(217200);
    // window.Fbase.createObject("teams", )
    // var ref = window.Fbase.mergeAccountA2B("guest:dong sun","facebook:10153378593488148");
    // window.Fbase.addUserToLadder("facebook:10153424122431194", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
    // window.Fbase.addUserToLadder("facebook:539060618", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
    // window.Fbase.addUserToLadder("facebook:10207621109160243", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
    // var fromId = this.refs.fromId.value;
    // var toId = this.refs.toId.value;
    // window.Fbase.mergeNorcalAccount(fromId, toId)
    return;
    var obj = {ccc:1};
    window.Fbase.createObject("leagues", "", obj);
    console.log(obj)
    var data = [
    "190024;Maria E  Chamberlain;2010399900;03/31/2016;3.0;Livermore, CA;F"];
    // data.forEach(function(row){
    //   var p = row.split(";");
    //   if (true || p[4] != "na") {
    //     window.Fbase.createObject("users", "norcal:"+p[0],{
    //       norcal: p[0],
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
      "recent" : 2,
      "player" : 3,
      "create" : 4
    }
    var index = parseInt(value);
    if (index) {
      return index;
    }
    return tab_maps[value];
  }
  render() {
    // console.log("menu", this.props.params)
    return (
      <div className="container">
        <div className="page-header">
          <h2 className="titleText">Live Tennis Ladder</h2>
        </div>
        <Tabs tabActive={this.getTabIndex(this.props.params.tab)} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Ladder'>
            <LadderOverview ladderId={this.props.params.ladderId} {...this.props} />
          </Tabs.Panel>
          <Tabs.Panel title="Recent">
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title="Player">
            <PlayerDetails playerId={this.props.params.playerId} {...this.props} />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
          {window.Fbase.authUid == window.Fbase.Henry &&
              <Tabs.Panel title='Create'>
                <MatchRecorder />
              </Tabs.Panel>
            }
          {window.Fbase.authUid == window.Fbase.Henry &&

              <Tabs.Panel title="Ad">
                <Dropzone onDrop={this.onUpload} className="pictureUpload">
                  <div>Try</div>
                </Dropzone>
                <button onClick={this.onTestButtonClick}>Test</button>
                <img src={this.state.file} className="player" />
                <div>from ID:<input ref="fromId"/></div>
                <div>to ID:<input ref="toId"/></div>

              </Tabs.Panel>

          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
