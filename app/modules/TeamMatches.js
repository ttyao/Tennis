import React from 'react';
var ReactFireMixin = require('reactfire');
var TimerMixin = require('react-timer-mixin');
var Dropzone = require('react-dropzone');
import PlayerName from './PlayerName';
import Timestamp from './Timestamp';
import ScoreBoard from './ScoreBoard';
import CommentsBox from './CommentsBox';
import Linkify from 'react-linkify';
import Progress from './Progress';
import moment from 'moment';
import PlayersSelect from './PlayersSelect';
import MatchBrief from './MatchBrief';

import Modal from 'react-modal';

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);

var Reflux = require('reflux');

var imageActions = Reflux.createActions([
  'loadImage'
]);

var imageStore = Reflux.createStore({
  listenables: [imageActions],

  init: function() {
    this.image = '';
    this.exif = {};
    this.latitude = null;
    this.longtitude = null;
  },

  onLoadImage: function(file, callback) {
    var self = this;

    // Read image file
    var reader = new FileReader();
    reader.readAsDataURL(file);

    // Get exif data from image
    EXIF.getData(file, function() {
      self.exif = this.exifdata;
      // console.log(this.exifdata, callback);
      if (callback) {
        callback(this.exifdata);
      }

      // var gps = self.getGPSData(self.exif);
      // if (gps && gps.latitude != null && gps.longtitude != null) {
      //   self.latitude = gps.latitude;
      //   self.longtitude = gps.longtitude;
      //   self.trigger({
      //     latitude: self.latitude,
      //     longtitude: self.longtitude
      //   });
      // }
    });
  },

  getGPSData: function(exif) {
    if (exif['GPSLatitude'] == null ||
      exif['GPSLatitude'].length == null ||
      exif['GPSLatitude'].length !== 3) {
      return;
    }
    if (exif['GPSLongitude'] == null ||
      exif['GPSLongitude'].length == null ||
      exif['GPSLongitude'].length !== 3) {
      return;
    }

    var latitude = exif['GPSLatitude'][0] + exif['GPSLatitude'][1] / 60.0 + exif['GPSLatitude'][2] / 3600.0;
    if (exif['GPSLatitudeRef'] === 'S') {
      latitude *= -1;
    }
    var longtitude = exif['GPSLongitude'][0] + exif['GPSLongitude'][1] / 60.0 + exif['GPSLongitude'][2] / 3600.0;
    if (exif['GPSLongitudeRef'] === 'W') {
      longtitude *= -1;
    }

    return {
      latitude: latitude,
      longtitude: longtitude
    };
  }
});

var TeamMatches = React.createClass({
  propTypes: {
    teamMatchId: React.PropTypes.string,
    onAfterLoad: React.PropTypes.func,
    visible: React.PropTypes.bool,
    type: React.PropTypes.string,
  },

  getInitialState () {
    return {
      pendingMatches: [[],[],[],[],[]],
    };
  },
  getDefaultProps () {
    return {
      visible: true
    };
  },
  mixins: [ReactFireMixin, TimerMixin, Reflux.connect(imageStore), 'exif'],

  componentWillMount () {
    var ref = window.Fbase.getRef("web/data/teammatches/"+this.props.teamMatchId);
    this.bindAsObject(ref, "teamMatch");
    var self = this;
    ref.once('value', function(snapshot) {
      let data = snapshot.val();
      if (!data || !data.teams || Object.keys(data.teams).length != 2) return;

      var teamIds = Object.keys(data.teams);
      self.setState({
        teamIds: teamIds
      });

      ref = window.Fbase.getRef("web/data/teams/"+teamIds[0]);
      ref.once('value', function(snapshot) {
        self.setState({team0: snapshot.val()});
      })
      ref = window.Fbase.getRef("web/data/teams/"+teamIds[1]);
      ref.once('value', function(snapshot) {
        self.setState({team1: snapshot.val()});
      })
    });
  },
  // getWinSetNum() {
  //   var winningSet = 0;
  //   if (this.state.match.status == "completed") {
  //     for (var i in this.state.match.scores) {
  //       if (this.state.match.scores[i].scores[0] > this.state.match.scores[i].scores[1]) {
  //         winningSet+=1;
  //       } else if (this.state.match.scores[i].scores[0] < this.state.match.scores[i].scores[1]) {
  //         winningSet-=1;
  //       }
  //     }
  //   }
  //   return winningSet;
  // },
  // onScoresChange(event, index) {
  //   var match = this.state.match;
  //   match.scores[Math.floor(index/2)].scores[index%2] = event.target.value;
  //   window.Fbase.updateMatchScores(match);
  //   if (match.status == "pending") {
  //     match.status = "active";
  //     window.Fbase.updateMatchStatus(match);
  //   }
  //   window.Fbase.createComment(
  //     this.state.match,
  //     "Updated set "+ (Math.floor(index/2)+1) + " score to " + match.scores[Math.floor(index/2)].scores[0] + " : " + match.scores[Math.floor(index/2)].scores[1],
  //     "system"
  //   );
  // },
  // completeMatch() {
  //   var match = this.state.match;
  //   if (window.now(match.matchTime) > window.now() + 24*3600*1000) {
  //     match.status = "pending";
  //   } else {
  //     if (match.scores[0].scores[0] + match.scores[0].scores[1] > 0) {
  //       match.status = "completed";
  //     } else {
  //       match.status = "canceled";
  //     }
  //   }
  //   window.Fbase.createComment(
  //     this.state.match,
  //     "Marked this match as " + match.status + ".",
  //     "system"
  //   );
  //   window.Fbase.updateMatchStatus(match);
  // },
  // editMatch() {
  //   var match = this.state.match;
  //   match.status = "active";
  //   window.Fbase.updateMatchStatus(match);
  // },
  // onNewCommentClick() {
  //   if (!window.Fbase.authUid) {
  //     alert("You need to login to leave a comment.");
  //     return;
  //   }
  //   this.setState({showNewCommentsBox: true});
  // },
  // onNewCommentsBoxCloseClick() {
  //   this.setState({showNewCommentsBox: false});
  // },

  onNewCommentsBoxSendClick(event) {
    console.log("title:", event, this.refs["newVideoTitle"])
    window.Fbase.updateVideoTitle(this.props.teamMatchId, this.state.latestVideoId, this.refs["newVideoTitle"].value);
    this.setState({showNewCommentsBox: false});
  },
  onCommentInputChange(event) {
    if (event.key == 'Enter' && event.target.value) {
      window.Fbase.createComment(this.props.teamMatchId, event.target.value, "text", true);
      this.refs["commentInput"].value = "";
    }
  },
  onUploadPics(files) {
    if (files && window.Fbase.authUid) {
      var time = window.now();
      window.Fbase.log(files[0].size + ","+files[0].type, "debug");

      var bucket = new AWS.S3({params: {Bucket: 'baytennis/teammatches/'+this.props.teamMatchId+"/"+window.Fbase.authUid}});
      var matchId = this.props.teamMatchId;
      var self = this;
      files.forEach(function(file) {
        var i = files.indexOf(file);
        var type = 'image';
        var key = time+":"+window.Fbase.authUid+":"+i;
        if (file.type.slice(0,5) == 'video') {
          type='video';
          if (files.length > 1) {
            alert("Video file can not be uploaded with other files together.")
            return;
          }
          if (file.size > 30 * 1024 * 1024) {
            alert("can not upload video file larger than 30MB");
            return;
          }
        } else if(file.type.slice(0, 5) == 'image') {
          if ( !( window.File && window.FileReader && window.FileList && window.Blob ) ) {
            alert('The File APIs are not fully supported in this browser.');
            return false;
          }
          imageActions.loadImage(files[0], function(exif) {

            window.ImageResizer.resizeImage(file, exif, function(dataUrl) {
              var params = {Key: "thumb:"+key, ContentType: "image/jpeg", Body: dataUrl, ACL: "public-read"};
              bucket.upload(params, function (err, data) {
                if (!err) {
                  console.log("thumb", key, data);
                  window.Fbase.createPicThumb(matchId, "comment:"+key, exif, data.Location, type, true);
                } else {
                  console.log(err);
                  window.Fbase.log(err, "error");
                }
              });
            });
          });
        } else {
          alert("File format is not supported.");
          return;
        }

        var picparams = {Key: type+":"+key, ContentType: file.type, Body: file, ACL: "public-read"};
        bucket.upload(picparams).on('httpUploadProgress', function(evt) {
            if (i == 0) {
              self.setState({uploadPercentage: Math.floor(evt.loaded / evt.total *100)});
            }
          }).send(function (err, data) {
            if (i == 0) {
              self.setState({uploadPercentage: 0});
            }
            if (!err) {
              window.Fbase.createPic(matchId, "comment:"+key, data.Location, type, true);
              if (type == "video") {
                self.setState({
                  showNewCommentsBox: true,
                  latestVideoId: "comment:"+key
                });
              }
            } else {
              console.log(err);
              alert("Upload failed, please try again.");
              window.Fbase.log(err, "error");
            }
        });
      });
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return true;
  },
  canEditMatch() {
    return this.state.match.creator == window.Fbase.authUid;
  },
  handlePlayerChange(id, value, line) {
    var matches = this.state.pendingMatches;
    var players = value.split(",");
    if (id == "player0") {
      matches[line][0] = players[0] || null;
      matches[line][2] = players[1] || null;
    } else {
      matches[line][1] = players[0] || null;
      matches[line][3] = players[1] || null;
    }
    console.log(matches)
    this.setState({pendingMatches:matches});
  },
  getPlayersSelects(count) {
    var result = [];
    for (let i=0; i< count; i++) {
      result.push(
        <PlayersSelect key={"playersSelect"+i} team0={this.state.team0} team1={this.state.team1} line={i} onChange={this.handlePlayerChange} ladder={this.props.ladder} teamIds={this.props.teamIds} />
      )
    }
    return result;
  },
  onConfirmPlayers() {
    var pendingMatches = this.state.pendingMatches;
    if (this.props.type == "usta combo") {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          if (!pendingMatches[i][j]) {
            alert("Missing player");
            return;
          }
        }
      }
    }
    var matches = {}
    for (let i = 0; i < 5; i++) {
      if (pendingMatches[i][0]) {
        let match = {
          message: "",
          scores: [{scores:[0,0]},{scores:[0,0]},{scores:[0,0]}],
          creator: window.Fbase.authUid,
          ladder: this.props.ladder,
          teamMatchId: this.props.teamMatchId,
          status: "active",
          players: pendingMatches[i],
          matchMoment: moment(),
        };
        var matchId = window.Fbase.createMatch(match);
        matches[matchId] = match;
      }
    }
    window.Fbase.updateTeamMatchStatus(this.props.teamMatchId, "active");
  },
  getMatches() {
    if (this.state.teamMatch.status == "pending") {
      if (this.props.type == "usta combo") {
        return (
          <div>
            {this.getPlayersSelects(3)}
            <button className="centerContainer" onClick={this.onConfirmPlayers}>Confirm</button>
          </div>
        );
      }
    } else if (this.state.teamMatch.matches) {
      var result = [];
      var line = 1;
      for (let i in this.state.teamMatch.matches) {
        result.push(
          <MatchBrief visible={true} key={i} matchId={i} line={line++} />
        );
      }
      return result;
    }
    return null;
  },
  getComments() {
    var teamMatch = this.state.teamMatch;
    var progressStyle = {
        float: "right",
      };
    return (
      <div>
        <div>
          <CommentsBox status={teamMatch.status} comments={teamMatch.comments} status={teamMatch.status} />
          <input className="commentInput" ref="commentInput" onKeyPress={this.onCommentInputChange} />
          <Dropzone onDrop={this.onUploadPics} className="pictureUpload">
            <img src="images/camera-icon.png" className="cameraIcon" />
          </Dropzone>
        </div>
        <div>
          <Timestamp time={teamMatch.matchTime} className="floatleft" />
          <div style={progressStyle} >
            <Progress radius="8" strokeWidth="3" percentage={this.state.uploadPercentage}/>
          </div>
          <div className='floatright'>
            <Modal
              className="Modal__Bootstrap modal-dialog"
              closeTimeoutMS={150}
              isOpen={this.state.showNewCommentsBox}
              onRequestClose={this.handleModalCloseRequest}
            >
              <div>Video Title:</div>
              <input ref="newVideoTitle" />
              <button className='floatright' onClick={this.onNewCommentsBoxSendClick}>Save</button>
              <button className='floatright' onClick={this.onNewCommentsBoxCloseClick}>Cancel</button>
            </Modal>
            {teamMatch.status}
          </div>
        </div>
      </div>
    );
  },
  render() {
    console.log(this.state)
    if (this.state.teamMatch && this.state.team0 && this.state.team1) {
      var matches = this.state.matches;
      return (
        <div className="matchBriefBody">
          <div>
            <table className="wholerow">
              <tbody>
                <tr>
                  <td className="playersection centerContainer">
                  {this.state.team0.name}
                  </td>
                  <td className="scoresection">
                  </td>
                  <td className="playersection centerContainer">
                  {this.state.team1.name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {this.getMatches()}
          {this.getComments()}
        </div>
      );

    }
    return null;
  }
});

module.exports = TeamMatches;
