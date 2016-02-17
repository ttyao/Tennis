import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import Head2Head from './Head2Head';
import LadderOverview from './LadderOverview';
var Dropzone = require('react-dropzone');

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
    this.onUpload = this.onUpload.bind(this);
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
    var self = this;
    var reader = new FileReader();
    reader.onload = function() {
      self.image = reader.result;
      self.trigger({
        image: self.image,
        latitude: null,
        longtitude: null
      });
    };
    reader.readAsDataURL(files[0]);
    try {
        EXIF.getData(file, function() {
          self.exif = this.exifdata;
          self.trigger({
            exif: self.exif
          });

          var gps = self.getGPSData(self.exif);
          if (gps && gps.latitude != null && gps.longtitude != null) {
            self.latitude = gps.latitude;
            self.longtitude = gps.longtitude;
            self.trigger({
              latitude: self.latitude,
              longtitude: self.longtitude
            });
          }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
    return;

    var bucket = new AWS.S3({params: {Bucket: 'baytennis/firebase'}});

    var file = files[0];
    if (file) {
      console.log(bucket, files);
      var results = document.getElementById('results');
      var fileId = "pic:"+window.now()+":"+window.Fbase.authUid;
      var params = {Key: fileId, ContentType: file.type, Body: file, ACL: "public-read"};
      bucket.upload(params, function (err, data) {
        if (!err) {
          console.log(data)
          window.Fbase.createPic(
            {".key" : "match:1454970406422:facebook:539060618"},
            data.Location
          );
        }
      });
    }
  }

  onTestButtonClick() {

    // var ref = window.Fbase.mergeAccountA2B("guest:Eddie Lin","3acfe162-0f10-4cdf-8d7b-edf164d137a4");
    window.Fbase.addUserToLadder("facebook:10153424122431194", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
    window.Fbase.addUserToLadder("facebook:539060618", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
    window.Fbase.addUserToLadder("facebook:10207621109160243", "ladder:2016-02-11-08-28-55-181:facebook:539060618")
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

  render() {
    console.log(this.props.params)
    const tab_maps = {
      "ladder" : 1,
      "recent" : 2,
      "h2h" : 3,
      "create" : 4
    }
    return (
      <div className="container">
        <div className="page-header">
          <h2 className="titleText">Live Tennis Ladder</h2>
        </div>
        <Tabs tabActive={tab_maps[this.props.params.tab]} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Ladder'>
            <LadderOverview ladder={this.props.params.ladder} />
          </Tabs.Panel>
          <Tabs.Panel title="Recent">
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title="H2H">
            <Head2Head player0={this.props.params.player0} player1={this.props.params.player1} />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
          {window.Fbase.authUid == window.Fbase.Henry &&
              <Tabs.Panel title='Create'>
                <MatchRecorder />
              </Tabs.Panel>
            }
          {window.Fbase.authUid == window.Fbase.Henry &&

              <Tabs.Panel title="Admin">
                <Dropzone onDrop={this.onUpload} className="pictureUpload">
                  <div>Try</div>
                </Dropzone>
                <button onClick={this.onTestButtonClick}>Test</button>
                <img src={this.state.file} className="player" />
              </Tabs.Panel>

          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
