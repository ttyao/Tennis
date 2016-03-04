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
import { Link } from 'react-router'

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

var MatchBrief = React.createClass({
  propTypes: {
    matchId: React.PropTypes.string,
    onAfterLoad: React.PropTypes.func,
    visible: React.PropTypes.bool,
    showTeam: React.PropTypes.bool,
  },

  getInitialState () {
    return {
      file: null,
      loading: true,
      waitForCache: false
    };
  },
  getDefaultProps () {
    return {
      visible: true,
      showTeam: false,
    };
  },
  mixins: [ReactFireMixin, TimerMixin, Reflux.connect(imageStore), 'exif'],

  componentWillMount () {
    // console.log("start mounting match: " + this.props.matchId, window.now().slice(10))
    if (!this.props.waitForCache) {
      var ref = window.Fbase.getRef("web/data/matches/"+this.props.matchId);
      var self = this;
      ref.once("value", function(snapshot) {
        // console.log("got tmid for match: " + self.props.matchId, window.now().slice(10))
        var data = snapshot.val();
        self.setState({
          loading: false,
          match: data
        });
        if (data && data.status == "active") {
          self.bindAsObject(ref, "match");
        }
        if (data && data.tmId) {
          var r = window.Fbase.getRef("web/data/teammatches/"+data.tmId+"/teams");
          r.once("value", function(snapshot) {
            // console.log("got team names for match: " + self.props.matchId, window.now().slice(10))
            var teams = snapshot.val();
            if (teams) {
              self.setState({teams:teams})
              let t0 = window.Fbase.getRef("web/data/teams/"+teams[0]);
              t0.once("value", function(t) {
                self.setState({team0: t.val()});
              })
              let t1 = window.Fbase.getRef("web/data/teams/"+teams[1]);
              t1.once("value", function(t) {
                self.setState({team1: t.val()});
              })
            }
          })
        }
        // console.log(data)
        if (data && data.ladderId) {
          let l = window.Fbase.getRef("web/data/ladders/"+data.ladderId);
          l.once("value", function(ladder) {
            self.setState({ladder: ladder.val(), ladderId:data.ladderId});
          })
        }
      });
    } else {
      this.waitForCache();
    }
  },
  waitForCache() {
    var self = this;
    if (typeof(window.Caching.matches[this.props.matchId]) == "object") {
      var match = window.Caching.matches[this.props.matchId];
      this.setState({
        loading: false,
        match: match
      })
      if (match.tmId) {
        var r = window.Fbase.getRef("web/data/teammatches/"+match.tmId+"/teams");
        r.once("value", function(snapshot) {
          // console.log("got team names for match: " + self.props.matchId, window.now().slice(10))
          var teams = snapshot.val();
          if (teams) {
            self.setState({teams:teams})
            let t0 = window.Fbase.getRef("web/data/teams/"+teams[0]);
            t0.once("value", function(t) {
              self.setState({team0: t.val()});
            })
            let t1 = window.Fbase.getRef("web/data/teams/"+teams[1]);
            t1.once("value", function(t) {
              self.setState({team1: t.val()});
            })
          }
        })
      }
      if (match.ladderId) {
        let l = window.Fbase.getRef("web/data/ladders/"+match.ladderId);
          l.once("value", function(ladder) {
            self.setState({ladder: ladder.val(), ladderId:match.ladderId});
        })
      }
      return;
    }
    this.setTimeout(function() {self.waitForCache()}, 10);
  },
  getWinSetNum() {
    var winningSet = 0;
    if (this.state.match.status == "completed") {
      for (var i in this.state.match.scores) {
        if (this.state.match.scores[i][0] > this.state.match.scores[i][1]) {
          winningSet+=1;
        } else if (this.state.match.scores[i][0] < this.state.match.scores[i][1]) {
          winningSet-=1;
        }
      }
    }
    return winningSet;
  },
  onScoresChange(event, index) {
    var match = this.state.match;
    match.scores[Math.floor(index/2)][index%2] = event.target.value;
    window.Fbase.updateMatchScores(match);
    if (match.status == "pending") {
      match.status = "active";
      window.Fbase.updateMatchStatus(match);
    }
    if (this.state.match.tmId) {
      window.Fbase.createComment(
        this.state.match.tmId,
        "Updated line "+this.props.line+": set "+ (Math.floor(index/2)+1) + " score to " + match.scores[Math.floor(index/2)][0] + " : " + match.scores[Math.floor(index/2)][1],
        "system",
        true
      );
    } else {
      window.Fbase.createComment(
        this.state.match[".key"],
        "Updated set "+ (Math.floor(index/2)+1) + " score to " + match.scores[Math.floor(index/2)][0] + " : " + match.scores[Math.floor(index/2)][1],
        "system"
      );
    }
  },
  completeMatch() {
    var match = this.state.match;
    if (window.now(match.time) > window.now() + 24*3600*1000) {
      match.status = "pending";
    } else {
      if (match.scores[0][0] + match.scores[0][1] > 0) {
        match.status = "completed";
      } else {
        match.status = "canceled";
      }
    }
    if (match.tmId) {
      window.Fbase.createComment(
        match.tmId,
        "Marked line "+this.props.line+" as " + match.status + ".",
        "system",
        true
      );
    }
    window.Fbase.createComment(
      this.state.match[".key"],
      "Marked this match as " + match.status + ".",
      "system"
    );
    window.Fbase.updateMatchStatus(match);
  },
  editMatch() {
    var match = this.state.match;
    match.status = "active";
    window.Fbase.updateMatchStatus(match);
  },
  onNewCommentClick() {
    if (!window.Fbase.authUid) {
      alert("You need to login to leave a comment.");
      return;
    }
    this.setState({showNewCommentsBox: true});
  },
  onNewCommentsBoxCloseClick() {
    this.setState({showNewCommentsBox: false});
  },

  onNewCommentsBoxSendClick(event) {
    console.log("title:", event, this.refs["newVideoTitle"])
    window.Fbase.updateVideoTitle(this.state.match[".key"], this.state.latestVideoId, this.refs["newVideoTitle"].value);
    this.setState({showNewCommentsBox: false});
  },
  onCommentInputChange(event) {
    if (event.key == 'Enter' && event.target.value) {
      window.Fbase.createComment(this.state.match[".key"], event.target.value, "text");
      this.refs["commentInput"].value = "";
    }
  },
  onUploadPics(files) {
    if (files && window.Fbase.authUid) {
      var time = window.now();
      window.Fbase.log(files[0].size + ","+files[0].type, "debug");

      var bucket = new AWS.S3({params: {Bucket: 'baytennis/matches/'+this.state.match['.key']+"/"+window.Fbase.authUid}});
      var matchId = this.state.match['.key'];
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
                  window.Fbase.createPicThumb(matchId, "comment:"+key, exif, data.Location, type);
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
              window.Fbase.createPic(matchId, "comment:"+key, data.Location, type);
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
    if (!nextState.match) {
      return false;
    }
    if (!this.state.match && !!nextState.match) {
      return true;
    }
    // if (this.state.refreshName != nextState.refreshName) {
    //   return true;
    // }
    // return true;
    var result = JSON.stringify(this.state) != JSON.stringify(nextState);
    return result;
  },
  canEditMatch() {
    return this.state.match.creator == window.Fbase.authUid;
  },
  getFooter() {
    var match = this.state.match;
    if (match.tmId) {
      if (this.canEditMatch()) {
        if (match.status == "active") {
          return (<button onClick={this.completeMatch} >Complete</button>);
        } else {
          return (<button onClick={this.editMatch} >Edit</button>);
        }
      }
    } else {
      var progressStyle = {
        // position: 'relative',
        float: "right",
      };
      return (
        <div>
          <Timestamp time={match.time} format="date" className="floatleft" />
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
            { this.canEditMatch() ?
                match.status == "active" ?
                  <button onClick={this.completeMatch} >Complete</button> :
                  <button onClick={this.editMatch} >Edit</button> :
                ""
            }
            {match.status}
          </div>
        </div>
      );
    }
  },
  showTeam() {
    if (this.props.showTeam) {
      if (this.state.team0 && this.state.team1) {
        return (
          <tr className='headerRow'>
            <td className="centerContainer"><Link to={"/ladder/"+this.state.team0.ladderId+"/"+this.state.teams[0]}>{this.state.team0.displayName}</Link></td>
            <td className="centerContainer"><Timestamp format="date" time={this.state.match.time} /></td>
            <td className="centerContainer"><Link to={"/ladder/"+this.state.team1.ladderId+"/"+this.state.teams[1]}>{this.state.team1.displayName}</Link></td>
          </tr>
        );
      }
      if (this.state.ladder) {
        return (
          <tr className='headerRow'>
            <td colSpan="3" className="centerContainer"><Link to={"/ladder/"+this.state.ladderId}>{this.state.ladder.displayName}</Link></td>
          </tr>
        );
      }
    }
  },
  render() {
    if (this.state.match) {
      var match = this.state.match;
      var self = this;
      var matchId = match['.key'];
      if (this.props.onAfterLoad) {
        var self = this;
        this.setTimeout(function() { self.props.onAfterLoad(matchId, match);}, 0);
      }
      if (this.props.visible && this.state.match.players && this.state.match.status != "canceled") {
        var winSetNum = this.getWinSetNum();
        var cls = "";
        if (!this.props.isTeamMatchView) {
          cls = "matchBriefBody"
        }
        return (
          <div className={cls}>
            { window.Fbase.isDebug() &&
              <div>{match['.key']}</div>
            }
            <div>
              <table className="wholerow notablespacing">
                <tbody>
                  {this.showTeam()}
                  <tr>
                    <td className="playersection centerContainer">
                      <PlayerName showNTRP={true} playerName={window.Fbase.getDisplayName(match.players[0])} key={match.players[0] && "player0"} playerId={match.players[0]} />
                      <br/>
                      <PlayerName showNTRP={true} playerName={window.Fbase.getDisplayName(match.players[2])} key={match.players[2] && "player2"} playerId={match.players[2]} />
                    </td>
                    <td className="scoresection">
                      <ScoreBoard scores={match.scores} onChange={this.onScoresChange} status={match.status}
                        editable={!!window.Fbase.authUid && match.status == "active"} />
                    </td>
                    <td className="playersection centerContainer">
                      <PlayerName showNTRP={true} playerName={window.Fbase.getDisplayName(match.players[1])} key={match.players[1] && "player1"} playerId={match.players[1]} />
                      <br/>
                      <PlayerName showNTRP={true} playerName={window.Fbase.getDisplayName(match.players[3])} key={match.players[3] && "player3"} playerId={match.players[3]} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!this.state.match.tmId &&
              <div>
                <Linkify>{this.state.match.message}</Linkify>
                <CommentsBox status={match.status} comments={match.comments} />
                <input className="commentInput" ref="commentInput" onKeyPress={this.onCommentInputChange} />
                <Dropzone onDrop={this.onUploadPics} className="pictureUpload">
                  <img src="images/camera-icon.png" className="cameraIcon" />
                </Dropzone>
              </div>
            }
            {this.getFooter()}
          </div>
        );
      }
    }
    if (this.state.loading) {
      return (
        <div className="centerContainer">{window.Fbase.isDebug() && this.props.matchId}<img src="/images/Tennisbatting.gif"/></div>
      )
    }
    return null;
  }
});

module.exports = MatchBrief;
