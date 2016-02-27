import Firebase from 'firebase';

window.Fbase = {
  baseUrl : "http://www.google.com",
  Henry: "facebook:539060618",
  isHenry: function() {
    return this.Henry == this.authUid;
  },
  refreshDisplayNames: function(uid, callback) {
    if (!uid) {
      if (callback) {
        callback(null);
      }
      return;
    }
    this.displayNames[uid] = "loading";
    var ref = this.getRef("web/data/users/"+uid);
    ref.once('value', function(snapshot) {
      var data = snapshot.val();
      if (data) {
        if (data.displayName && !data.claimerId) {
          window.Fbase.displayNames[uid] = data.displayName;
          // if (!data[key].displayName_) {
          //   var f = window.Fbase.getRef("web/data/users/"+key+"/displayName_");
          //   f.set(data[key].displayName.toLowerCase());
          // }
        }
        if (callback) {
          callback(data.displayName || null);
        }
      }
    });
  },
  init: function(callback) {
    this.authUid = this.getAuthUid();
    this.displayNames = {};
    this.refreshDisplayNames(this.authUid, function(){
      window.Fbase.log("init", "visit");
      if (callback) {
        callback();
      }
    })
  },
  getAuthName: function() {
    return this.getDisplayName(this.authUid);
  },
  setDisplayName: function(uid, displayName) {
    this.displayNames[uid] = displayName;
  },
  getDisplayName: function(uid, callback) {
    if (!uid) {
      if (callback) {
        callback(null);
      }
      return null;
    }
    if (this.displayNames[uid]) {
      if (callback) {
        callback(this.displayNames[uid]);
      }
      return this.displayNames[uid];
    }
    this.refreshDisplayNames(uid, callback);
    return "loading";
  },
  getUserId: function(displayName) {
    for (var key in this.displayNames) {
      if (this.displayNames[key] == displayName) {
        return key;
      }
    }
    return displayName;
  },
  isValidDisplayName: function(displayName) {
    return displayName && displayName.indexOf(':') < 0 && displayName.indexOf("-") < 0;
  },
  isDebug: function() {
    return window.location.hostname == 'localhost';
  },
  getAuthUid: function() {
    var ref = new Firebase(this.baseUrl);
    var authData = ref.getAuth();
    this.authUid = authData ? authData["uid"] : "";
    return this.authUid;
  },
  getRef: function(path) {
    if (path && path[0] != '/') {
      path = "/" + path;
    } else {
      path = "";
    }
    return new Firebase(this.baseUrl+path);
  },

  // async callback with displayName of uid
  onceUserName: function(uid, callback) {
    var ref = this.getRef("web/data/users/"+uid);
    ref.once('value', function(snapshot) {
      callback(snapshot.val() ? snapshot.val().displayName : null);
    });
  },

  // very inefficient now, need to look into index later
  onceDisplayNameExists: function(displayName, callback) {
    if (displayName == null) {
      callback.call(this, null);
      return;
    }
    var ref = window.Fbase.getRef("web/data/users");
    ref.once('value', function(snapshot){
      var users = snapshot.val();
      for (let key in users) {
        if (users[key].displayName && users[key].displayName_ == displayName.toLowerCase()) {
          callback.call(this, key);
          return;
        }
      }
      callback.call(this, null);
    });
  },
  updateLadderRoster: function(roster, ladder) {
    var ref = this.getRef("web/data/ladders/"+ladder+"/users");
    var players = {}
    var users = roster ? roster.split(",") : [];
    for (let i in users) {
      players[users[i]] = users[i];
    }
    console.log(players)
    console.log(users)
    ref.set(players);
    this.log("update ladder roster:"+ladder,"write", "updateRoster");
  },
  createUser: function(displayName, onComplete, caller) {
    if (this.authUid) {
      var lowcase = displayName.toLowerCase();
      this.onceUserName("guest:"+lowcase, function(username) {
        if (!username) {
          var ref = window.Fbase.getRef("web/data/users/guest:"+lowcase);
          ref.set({
            creator: window.Fbase.getAuthUid(),
            displayName: displayName,
            displayName_: lowcase,
          }, function(error) {
            if(!error && onComplete) {
              onComplete.call(caller, error);
            }
          });
          window.Fbase.log("create user: "+displayName, "write", "createUser");
        } else if (onComplete) {
          onComplete.call(caller);
        }
      });
    }
  },
  createMatch: function(match) {
    var m = {};
    var createdTime = window.now();
    var matchId = "match:"+createdTime+":"+this.authUid;
    m["creator"] = this.authUid;
    m["matchTime"] = window.now(match.matchMoment.unix()*1000);

    // There is no transaction support...

    if (match.ladder && match.ladder.id) {
      this.addMatchToLadder(matchId, match.ladder.id);
    } else {
      alert("You can only create a match belonging to certain ladder.")
      return;
    }
    match.players.forEach(function(player) {
      if (player) {
        let playerRef = this.getRef("web/data/users/"+player.toLowerCase()+"/matches/"+matchId);
        playerRef.set(m);
      }
    }, this);

    if (match.teamMatchId) {
      m["teamMatchId"] = match.teamMatchId;
      let Ref = this.getRef("web/data/teammatches/"+match.teamMatchId+"/matches/"+matchId);
      Ref.set(m);
    }

    m["scores"] = match.scores;
    m["updatedTime"] = createdTime;
    m["status"] = match.status;
    m["ladderId"] = match.ladder.id;
    m["message"] = match.message;

    m["players"] = [];
    m["players"][0] = match.players[0] ? match.players[0].toLowerCase() : null;
    m["players"][1] = match.players[1] ? match.players[1].toLowerCase() : null;
    m["players"][2] = match.players[2] ? match.players[2].toLowerCase() : null;
    m["players"][3] = match.players[3] ? match.players[3].toLowerCase() : null;

    var matchRef = this.getRef('web/data/matches/'+matchId);
    matchRef.set(m, function(error) {
      if (error) {
        alert("Can't save match.");
      } else {
        // location.reload();
      }
    });
    return matchId;
  },
  updateTeamMatchStatus: function(teamMatchId, status) {
    var ref = this.getRef("web/data/teammatches/"+teamMatchId+"/status");
    ref.set(status);
  },
  updateMatchScores: function(match) {
    var scores = match.scores;
    var matchId = match['.key'];

    var matchRef = this.getRef('web/data/matches/'+matchId+"/scores");
    matchRef.set(scores);

    var ref = this.getRef('web/data/matches/'+matchId+"/updatedTime");
    ref.set(window.now());
    this.log("update match "+matchId, "write", "updateMatchScores");
  },
  updateMatchStatus: function(match) {
    var matchId = match['.key'];

    var matchRef = this.getRef('web/data/matches/'+matchId+"/status");
    matchRef.set(match.status);

    var ref = this.getRef('web/data/matches/'+matchId+"/updatedTime");
    ref.set(window.now());
    this.log("update match status to "+match.status+" -- "+matchId, "write", "updateMatchStatus");
  },
  log: function(message, type, subtype) {
    try {
      var id = this.getDisplayName(this.authUid);
      if (!id) {
        this.setSessionId();
        id = this.sessionId;
      }
      if (id.slice(0,8) == "visitor:") {
        id = "visitor/" + id.slice(8);
      }

      if (id.indexOf(".") >=0) {
        this.log("id error:"+id, "error", "id");
        return;
      }
      var log = {
        message: message,
        creator: this.authUid,
        type: type,
      };
      if (type == "visit") {
        if (this.authUid == this.Henry) {
          return;
        }
        log.userAgent = navigator.userAgent;
        var ref = this.getRef('web/data/logs/visitlog/'+window.now()+"-"+id);
        ref.set(log);
      }
      var logRef = this.getRef('web/data/logs/'+type+"/"+(subtype ? subtype+"/" : "")+id+"/"+window.now());
      logRef.set(log);
    } catch (err) {
      console.log(err)
    }
  },
  setSessionId: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    this.sessionId = "visitor:" + window.now() + ":" + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },
  mergeNorcalAccount: function(usta, toId) {
    var ref = this.getRef("web/data/users");
    ref.orderByChild("usta").equalTo(usta).limitToFirst(1).once('value', function(snapshot) {
      var oldUsers = snapshot.val();
      if (!oldUsers) {
        alert("not found");
        return;
      }
      var oldUserId = Object.keys(oldUsers)[0];
      var oldUser = oldUsers[oldUserId];
      if (oldUser.claimerId) {
        alert("account already been claimed by "+oldUser.claimerId);
        return;
      }
      delete oldUser.teams;
      delete oldUser.matches;
      console.log(oldUser)
      ref = window.Fbase.getRef("web/data/users/"+toId);
      ref.update(oldUser);
      ref = window.Fbase.getRef("web/data/users/"+toId+"/merges/"+oldUserId);
      ref.set(oldUserId);
      ref = window.Fbase.getRef("web/data/users/"+oldUserId+"/claimerId");
      ref.set(toId);

      // window.Fbase.mergeAccountA2B(Object.keys(oldUser)[0], toId);
    });
  },
  mergeAccountA2B: function(fromId, toId) {
    // var ref = this.getRef("web/data/users/"+fromId);
    // ref.once('value', function(old) {
    //   var oldUser = old.val();
    //   if (!oldUser) {
    //     alert("from id not found.");
    //     return;
    //   }
    //   var oldRef = window.Fbase.getRef("web/data/users/"+fromId+"/claimerId");
    //   oldRef.set(toId);
    //   window.Fbase.log("merge "+ fromId + " to "+ toId, "write", "mergeAccount");
    //   var newref = window.Fbase.getRef("web/data/users/"+toId);
    //   for (let key in oldUser) {
    //     if (key != "matches" && key != "ladders" && key != "teams" && key != "status" &&
    //        (typeof(oldUser[key]) == 'number' || typeof(oldUser[key]) == 'string')) {
    //       newref.child(key).set(oldUser[key]);
    //     }
    //   }
    //   if (fromId.indexOf("n:") < 0) {
    //     var ref = window.Fbase.getRef("web/data/matches");
    //     ref.once('value', function(snapshot){
    //       var matches = snapshot.val();
    //       for (let key in matches) {
    //         var players = matches[key].players;
    //         for (let i = 0; i < 4; i++) {
    //           if (players[i] == fromId) {
    //             var n = window.Fbase.getRef("web/data/matches/"+key+"/players/"+i);
    //             n.set(toId);
    //             break;
    //           }
    //         }
    //       }
    //     });
    //     ref = window.Fbase.getRef("web/data/users/"+fromId+"/matches");
    //     ref.once('value', function(snapshot) {
    //       var oldMatches = snapshot.val();
    //       if (oldMatches) {
    //         var newRef = window.Fbase.getRef("web/data/users/"+toId+"/matches");
    //         newRef.once('value', function(s) {
    //           var newMatches = s.val() || {};
    //           for (let key in oldMatches) {
    //             newMatches[key] = oldMatches[key];
    //           }
    //           newRef.set(newMatches);
    //         })
    //       }
    //     });
    //   }
    // })
  },
  createPic: function(matchId, picId, picUrl, type, isTeamMatch) {
    var baseRef = this.getRef("web/data/"+(isTeamMatch ? "team" : "")+"matches/" + matchId + '/comments/' + picId);
    baseRef.child("URL").set(picUrl);
    if (type == "video") {
      baseRef.child("type").set(type);
      baseRef.child("creator").set(this.authUid);
      baseRef.child("createdTime").set(window.now());
    }
    this.log("create picture", "write", "createPic");
  },
  createPicThumb:function(matchId, picId, exif, thumbUrl, type, isTeamMatch) {
    var baseRef = this.getRef("web/data/"+(isTeamMatch ? "team" : "")+"matches/" + matchId + '/comments/' + picId);

    baseRef.child("thumbURL").set(thumbUrl);
    baseRef.child("type").set(type);
    baseRef.child("creator").set(this.authUid);
    baseRef.child("createdTime").set(window.now());
    baseRef.child("exif").set(exif);
    this.log("create thumb", "write", "createThumb");
  },
  updateVideoTitle:function(matchId, commentId, videoTitle, isTeamMatch) {
    var key = "web/data/matches/" + matchId + '/comments/' + commentId + "/title";
    if (isTeamMatch) {
      key = "web/data/teammatches/" + matchId + '/comments/' + commentId + "/title";
    }
    var ref = this.getRef(key);
    ref.set(videoTitle);
    this.log(key, "write", "createVideoTitle");
  },
  createComment: function(matchId, comment, type, isTeamMatch) {
    var commentId = "comment:"+window.now()+":"+this.authUid;
    var key = "web/data/matches/" + matchId + '/comments/' + commentId;
    if (isTeamMatch) {
      key = "web/data/teammatches/" + matchId + '/comments/' + commentId
    }
    var ref = this.getRef(key);
    ref.set({
      comment: comment,
      creator: this.authUid,
      createdTime: window.now(),
      type: type
    });
    this.log("create comment", "write", "createComment");
  },
  createLadder: function(ladderName) {
    if (!this.authUid) {
      return;
    }
    var ref = this.getRef("web/data/ladders/ladder:"+window.now()+":"+this.authUid);
    ref.set({
      name: ladderName,
      createdTime: window.now(),
      creator: this.authUid
    });
    this.log("created ladder "+ladderName, "write", "createLadder");
  },
  createTeam: function(teamName) {
    if (!this.authUid) {
      return;
    }
    var ref = this.getRef("web/data/teams/team:"+window.now()+":"+this.authUid);
    ref.set({
      name: teamName,
      createdTime: window.now(),
      creator: this.authUid
    });
    this.log("created team "+ladderName, "write", "createTeam");
  },

  addUserToLadder: function(userId, ladderId) {
    if (!this.authUid) {
      return;
    }
    var ref = this.getRef("web/data/ladders/"+ladderId+"/users/"+userId);
    ref.set({
      createdTime: window.now(),
      creator: this.authUid
    });
    this.log("add user "+userId+" to ladder "+ladderId, "write", "addUserToLadder");
  },
  addMatchToLadder: function(matchId, ladderId) {
    if (!this.authUid) {
      return;
    }
    console.log(ladderId, matchId)
    var ref = this.getRef("web/data/ladders/"+ladderId+"/matches/"+matchId);
    ref.set({
      createdTime: window.now(),
      creator: this.authUid
    });
    this.log("add match "+matchId+" to ladder "+ladderId, "write", "addMatchToLadder");
  },
  addUserToObject: function(type, objectId, uid) {
    if (!uid || !objectId) return;
    if (["teams", "ladders"].indexOf(type) == -1) {
      alert("Type not supported.");
      return;
    }
    var ref = this.getRef("web/data/"+type+"/"+objectId+"/users/"+uid);
    ref.set({
      creator: this.getAuthName(),
      createTime: window.now()
    });
  },
  createObject: function(type, path, object) {
    if (["teams", "leagues", "users"].indexOf(type) == -1) {
      alert("Type not supported.");
      return;
    }
    var ref = this.getRef("web/data/"+type+"/"+path);
    ref.set(object)
  },
  updateLadderStats(ladderId, stats) {
    var ref = this.getRef("web/data/ladders/"+ladderId+"/stats");
    ref.set(stats);
  }
};
