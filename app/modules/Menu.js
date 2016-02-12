import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import Modal from 'react-modal';
import Head2Head from './Head2Head';
var Dropzone = require('react-dropzone');
// var ExifImage = require('exif').ExifImage;

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

    // var ref = window.Fbase.mergeAccountA2B("guest:Junya Zhang","7062f35c-bc7e-48a1-a3f2-d2ca587cb644");
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
    console.log(window.Fbase.displayNames)
    console.log(window.Fbase.getUserId("Henry T Yao"));
    // window.Fbase.addMatchToLadder("match:1454970406422:facebook:539060618", "ladder:2016-02-11-08-28-55-181:facebook:539060618");
  }

  render() {
    console.log(this.props.params)
    const tab_maps = {
      "recent" : 1,
      "ladder" : 2,
      "h2h" : 3,
      "create" : 2
    }
    return (
      <div>
        <div className="container page-header">
          <h2 className="titleText">Live Tennis Ladder</h2>
        </div>
        <Tabs tabActive={tab_maps[this.props.params.tab]} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Recent'>
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title='Create'>
            <MatchRecorder />
          </Tabs.Panel>
          <Tabs.Panel title="H2H">
            <Head2Head player0={this.props.params.player0} player1={this.props.params.player1} />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
          { window.Fbase.authUid == "facebook:539060618" &&
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
