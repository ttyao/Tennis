import React from 'react';
var ReactFireMixin = require('reactfire');
var TimerMixin = require('react-timer-mixin');
var Dropzone = require('react-dropzone');
import PlayerName from './PlayerName';
import Timestamp from './Timestamp';
import CommentsBox from './CommentsBox';
import Linkify from 'react-linkify';
import Progress from './Progress';
import moment from 'moment';
import PlayersSelect from './PlayersSelect';
import MatchBrief from './MatchBrief';
import { Link } from 'react-router';
import TeamMatchCreator from './TeamMatchCreator';

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
      matches: [{players:[]},{players:[]},{players:[]},{players:[]},{players:[]},{players:[]}],
      teamScores: {},
    };
  },
  getDefaultProps () {
    return {
      visible: true
    };
  },
  mixins: [ReactFireMixin, TimerMixin, Reflux.connect(imageStore), 'exif'],

  componentDidMount () {
    var ref = window.Fbase.getRef("web/data/teammatches/"+this.props.teamMatchId);
    this.bindAsObject(ref, "teamMatch");
    var self = this;
    ref.once('value', function(snapshot) {
      let data = snapshot.val();
      if (!data || !data.teams || Object.keys(data.teams).length != 2) return;
      var teamIds = Object.keys(data.teams);
      if (self.isMounted()) {
        self.setState({
          teamIds: data.teams
        });
      }

      ref = window.Fbase.getRef("web/data/teams/"+data.teams[0]);
      ref.once('value', function(snapshot) {
        if (self.isMounted()) {
          self.setState({team0: snapshot.val()});
        }
      })
      ref = window.Fbase.getRef("web/data/teams/"+data.teams[1]);
      ref.once('value', function(snapshot) {
        if (self.isMounted()) {
          self.setState({team1: snapshot.val()});
        }
      })
      var i = 1;
      for (let m in data.matches) {
        self.loadMatch(m, i++)
      }
    });
  },

  loadMatch(matchId, m) {
    var self = this;
    Fbase.getRef("web/data/matches/"+matchId).once("value", function(s) {
      if (self.isMounted() && s.val()) {
        var matches = self.state.matches;
        matches[m] = s.val();
        self.setState(matches);
      }
    })
  },

  onNewCommentsBoxSendClick(event) {
    console.log("title:", event, this.refs["newVideoTitle"])
    window.Fbase.updateVideoTitle(this.props.teamMatchId, this.state.latestVideoId, this.refs["newVideoTitle"].value, this.state.teamIds);
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
                  window.Fbase.createPicThumb(matchId, self.state.matches, "comment:"+key, exif, data.Location, type, self.state.teamIds);
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
              window.Fbase.createPic(matchId, self.state.matches, "comment:"+key, data.Location, type, self.state.teamIds);
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
  canEditMatch() {
    for (let i in this.state.team0.players) {
      if (Fbase.authUids.indexOf(i) >= 0) {
        return true;
      }
    }
    for (let i in this.state.team1.players) {
      if (Fbase.authUids.indexOf(i) >= 0) {
        return true;
      }
    }
    return Fbase.authUid == Fbase.Henry;
  },
  onAfterLoad(matchId, match) {
    var setWin = 0;
    var scores = match.scores;
    for (let i in scores) {
      if (scores[i][0] > scores[i][1]) {
        setWin++;
      } else if (scores[i][0] < scores[i][1]) {
        setWin--;
      }
    }
    if (setWin) {
      var teamScores = this.state.teamScores;
      if (setWin > 0) teamScores[match.line] = 1;
      if (setWin < 0) teamScores[match.line] = -1;
      this.setState({teamScores: teamScores});
    }
    if (this.props.onAfterLoad) {
      this.props.onAfterLoad(matchId, match)
    }
  },
  onEnterLineup() {
    this.setState({
      show: true,
    });
  },
  getMatches() {
    if (this.state.teamMatch.status == "pending") {
      if (this.props.type == 'Adult' && this.canEditMatch()) {
        return (
          <div className="centerContainer">
            <button onClick={this.onEnterLineup}>Enter lineup</button>
          </div>
        );
      }
    } else if (this.state.teamMatch.matches) {
      var result = [];
      var line = 1;
      for (let i in this.state.teamMatch.matches) {
        result.push(
          <MatchBrief isTeamMatchView={true} visible={true} key={i} matchId={i} line={line++} onAfterLoad={this.onAfterLoad} />
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
          <CommentsBox status={teamMatch.status} comments={teamMatch.comments} />
          <input className="commentInput" ref="commentInput" onKeyPress={this.onCommentInputChange} />
          <Dropzone onDrop={this.onUploadPics} className="pictureUpload">
            <img src="images/camera-icon.png" className="cameraIcon" />
          </Dropzone>
          <div style={progressStyle} >
            <Progress radius="8" strokeWidth="3" percentage={this.state.uploadPercentage}/>
          </div>
        </div>
        <div>
          <Modal
            className="Modal__Bootstrap modal-dialog"
            closeTimeoutMS={150}
            isOpen={this.state.showNewCommentsBox}
            onRequestClose={this.handleModalCloseRequest}
          >
            <div>Video Title:</div>
            <input ref="newVideoTitle" />
            <button className='floatright' onClick={this.onNewCommentsBoxSendClick}>Save</button>
            <button className='floatright' onClick={this.handleModalCloseRequest}>Cancel</button>
          </Modal>
        </div>
      </div>
    );
  },
  handleModalCloseRequest() {
    this.setState({
      showNewCommentsBox: false,
      show: false
    })
  },
  getTeamScores() {
    var a=0, b=0;
    for (let i in this.state.teamScores) {
      if (this.state.teamScores[i] > 0) {
        a++;
      }
      if (this.state.teamScores[i] < 0) {
        b++;
      }
    }
    return <div> {a} : {b} </div>;
  },
  onLineupConfirm(matches) {
    for (let i = 0; i < 5; i++) {
      if (matches[i][0]) {
        let match = {
          message: "",
          scores: [{scores:[0,0]}, {scores:[0,0]}, {scores:[0,0]}],
          creator: window.Fbase.authUid,
          ladder: this.props.ladder,
          tmId: this.props.teamMatchId,
          status: "active",
          players: matches[i],
          matchMoment: moment(),
        };
        var matchId = window.Fbase.createMatch(match, i + 1);
        matches[matchId] = match;
      }
    }
    window.Fbase.updateTeamMatchStatus(this.props.teamMatchId, "active");
    location.reload();
  },
  render() {
    if (this.state.teamMatch && this.state.team0 && this.state.team1 && this.state.teamMatch.status != "merged") {

      let max = 500;
      var modalStyle = {
        content: {
          padding: "20px 0",
          top: "10px",
          bottom: "10px",
          left: window.innerWidth > max ? ((innerWidth-max)/2)+"px" : "10px",
          right: "10px",
          maxWidth: max+"px"
        }
      }
      return (
        <div className="matchBriefBody">
          <div>
            <table className="wholerow notablespacing">
              <tbody>
                <tr className="headerRow">
                  <td className="playersection centerContainer">
                    <Link to={"/ladder/"+this.state.team0.ladderId+"/"+this.state.teamIds[0]}>{this.state.team0.displayName}</Link>
                  </td>
                  <td className="centerContainer">
                    <Timestamp format="date" time={this.state.teamMatch.time} />
                    {this.getTeamScores()}
                  </td>
                  <td className="playersection centerContainer">
                    <Link to={"/ladder/"+this.state.team1.ladderId+"/"+this.state.teamIds[1]}>{this.state.team1.displayName}</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {this.getMatches()}
          {this.getComments()}
          <Modal
            className="Modal__Bootstrap modal-dialog"
            closeTimeoutMS={150}
            style={modalStyle}
            isOpen={this.state.show}
            onRequestClose={this.handleModalCloseRequest}
          >
            <TeamMatchCreator teams={[this.state.team0, this.state.team1]} onCancel={this.handleModalCloseRequest} onConfirm={this.onLineupConfirm}/>
          </Modal>
        </div>
      );
    }
    return null;
  }
});

module.exports = TeamMatches;
