import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import Modal from 'react-modal';
import Head2Head from './Head2Head';
var Dropzone = require('react-dropzone');
import ReactPlayer from 'react-player';
var ReactS3Uploader = require('react-s3-uploader');
import S3Upload from './S3Upload';

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
    // var ref = window.Fbase.getRef("web/data/matches");
    // ref.once('value', function(snapshot) {
    //   var matches = snapshot.val();
    //   console.log(matches);
    //   for (let m in matches) {
    //     var match = matches[m];
    //     var mref = ref.child(m+"/players");
    //     var players = [match.players.player1, match.players.player2];
    //     if (match.players.player3) {
    //       players.push(match.players.player3);
    //       players.push(match.players.player4);
    //     }
    //     mref.set(players);
    //   }
    // });

    // var ref = window.Fbase.mergeAccountA2B("guest:Junya Zhang","7062f35c-bc7e-48a1-a3f2-d2ca587cb644");
    window.Fbase.createPic({".key": "match:1454970406422:facebook:539060618"}, files[0]);
    this.setState({file: files[0].preview}, function() { console.log("???")});
  }

  render() {
    return (
      <div>
        <Tabs tabActive={1} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='最新战报'>
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title='输入战绩'>
            <MatchRecorder />
          </Tabs.Panel>
          <Tabs.Panel title="H2H">
            <Head2Head player1={window.Fbase.authUid} player2="" />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
          { window.Fbase.authUid == "facebook:539060618" &&
            <Tabs.Panel title="Admin">
              <Dropzone onDrop={this.onUpload} className="pictureUpload">
                <div>Try</div>
              </Dropzone>
              <img src={this.state.file} className="player" />
              <ReactPlayer
                className="player"
                url={this.state.file}
                playing={true}
              />

            </Tabs.Panel>
          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
