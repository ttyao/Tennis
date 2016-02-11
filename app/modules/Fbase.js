window.Fbase = {
  baseUrl : "https://blistering-torch-8342.firebaseio.com",
  Henry: "facebook:539060618",
  isHenry: function() {
    return this.Henry == this.authUid;
  },
  refreshDisplayNames: function(callback) {
    var ref = this.getRef("web/data/users");
    ref.once('value', function(snapshot) {
      var data = snapshot.val();
      for (let key in data) {
        window.Fbase.displayNames[key] = data[key].displayName;
      }
      if (callback) {
        callback();
      }
    });
  },
  init: function(callback) {
    this.authUid = this.getAuthUid();
    this.displayNames = {};
    this.refreshDisplayNames(function() {
      window.Fbase.log("init", "visit");
      if (callback) {
        callback();
      }
    });
  },
  getAuthName: function() {
    return this.getDisplayName(this.authUid);
  },
  getDisplayName: function(uid) {
    if (this.displayNames[uid]) {
      return this.displayNames[uid];
    }
    this.refreshDisplayNames();
    return uid;
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
    var ref = window.Fbase.getRef("web/data/users");
    ref.once('value', function(snapshot){
      var users = snapshot.val();
      for (let key in users) {
        if (users[key].displayName.toLowerCase() == displayName.toLowerCase()) {
          callback.call(this, key);
          return;
        }
      }
      callback.call(this, null);
    });
  },
  createUser: function(displayName, onComplete, caller){
    if (this.authUid) {
      this.onceUserName("guest:"+displayName, function(username) {
        if (!username) {
          var ref = window.Fbase.getRef("web/data/users/guest:"+displayName);
          ref.set({
            creator: window.Fbase.getAuthUid(),
            displayName: displayName
          }, function(error) {
            if(!error && onComplete) {
              onComplete.call(caller, error);
            }
          });
          window.Fbase.log("create user: "+displayName, "write");
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
    m["message"] = match.message;
    m["creator"] = this.authUid;

    // There is no transaction support...

    match.players.forEach(function(player) {
      if (player) {
        let playerRef = this.getRef("web/data/users/"+player+"/matches/"+matchId);
        playerRef.set(m);
      }
    }, this);

    m["scores"] = match.scores;
    m["updatedTime"] = createdTime;
    m["status"] = match.status;
    m["matchTime"] = window.now(match.matchMoment.unix()*1000);
    m["players"] = match.players;

    var matchRef = this.getRef('web/data/matches/'+matchId);
    matchRef.set(m, function(error) {
      if (error) {
        alert("Can't save match.");
      } else {
        location.reload();
      }
    });
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
    var id = this.getDisplayName(this.authUid);
    if (!id) {
      id = this.sessionId;
    }
    if (id.slice(0,8) == "visitor:") {
      id = "visitor/" + id.slice(8);
    }
    var logRef = this.getRef('web/data/logs/'+type+"/"+(subtype ? subtype+"/" : "")+id+"/"+window.now());
    logRef.set({
      message: message,
      creator: id,
      type: type,
    });
  },
  setSessionId: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    this.sessionId = "visitor:" + s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },
  mergeAccountA2B: function(fromId, toId) {
    // change player ids in all matches.
    var ref = window.Fbase.getRef("web/data/matches");
    ref.once('value', function(snapshot){
      var matches = snapshot.val();
      for (let key in matches) {
        var players = matches[key].players;
        var changed = false;
        for (let i = 0; i < 4; i++) {
          if (players[i] == fromId) {
            players[i] = toId;
            changed = true;
          }
        }
        if (changed) {
          ref.child(key+"/players").set(players);
        }
      }
    });
  },
  createPic: function(matchId, picId, picUrl, type) {
    var baseRef = this.getRef("web/data/matches/" + matchId + '/comments/' + picId);
    baseRef.child("URL").set(picUrl);
    if (type == "video") {
      baseRef.child("type").set(type);
      baseRef.child("creator").set(this.authUid);
      baseRef.child("createdTime").set(window.now());
    }
    this.log("create picture", "write", "createPic");
  },
  createPicThumb:function(matchId, picId, thumbUrl, type) {
    var baseRef = this.getRef("web/data/matches/" + matchId + '/comments/' + picId);

    baseRef.child("thumbURL").set(thumbUrl);
    baseRef.child("type").set(type);
    baseRef.child("creator").set(this.authUid);
    baseRef.child("createdTime").set(window.now());
    this.log("create thumb", "write", "createThumb");
  },
  updateVideoTitle:function(match, commentId, videoTitle) {
    var key = "web/data/matches/" + match['.key'] + '/comments/' + commentId + "/title";
    console.log(match, commentId, videoTitle, key);
    var ref = this.getRef(key);
    ref.set(videoTitle);
    this.log(key, "write", "createVideoTitle");
  },
  createComment: function(match, comment, type) {
    var commentId = "comment:"+window.now()+":"+this.authUid;
    var ref = this.getRef("web/data/matches/" + match['.key'] + '/comments/' + commentId);

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
    var ref = this.getRef("web/data/ladders/"+ladderId+"/matches/"+matchId);
    ref.set({
      createdTime: window.now(),
      creator: this.authUid
    });
    this.log("add match "+matchId+" to ladder "+ladderId, "write", "addMatchToLadder");
  }
};
