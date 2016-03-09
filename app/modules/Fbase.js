import Firebase from 'firebase';

window.Fbase = {
  baseUrl : "http://www.google.com",
  Henry: "ef4b838a-13db-470c-a0b5-669234fa09c6",
  isHenry: function() {
    return this.Henry == this.authUid;
  },
  init: function(callback) {
    this.startTime = new Date();
    this.authUid = this.getAuthUid();
    // if (this.isDebug()) {
    //   Firebase.enableLogging(true);
    // }
    window.Caching.players[this.authUid || this.Henry] = "pending";
    window.Caching.loadPlayers();
    Caching.initLadders(Fbase.authUid);
    window.Caching.getDisplayName(this.authUid, function(){
      window.Fbase.log("init", "visit");
      if (callback) {
        callback();
      }
    })
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
  getNRef: function(path) {
    var id = parseInt(path.split("/")[4].split(":")[1]);
    if (id >= 540000) {
      return new Firebase("https://tennismatches54.firebaseio.com" + path);
    } else if (id >=510000 && id < 540000) {
      return new Firebase("https://tennismatches51.firebaseio.com" + path);
    } else if (id >= 480000 && id < 510000) {
      return new Firebase("https://tennismatches48.firebaseio.com" + path);
    } else if (id >=450000 && id < 480000) {
      return new Firebase("https://tennismatches45.firebaseio.com" + path);
    } else if (id >=430000 && id < 450000) {
      return new Firebase("https://tennismatches43.firebaseio.com" + path);
    } else if (id >=420000 && id < 430000) {
      return new Firebase("https://tennismatches42.firebaseio.com" + path);
    } else if (id >=410000 && id < 420000) {
      return new Firebase("https://tennismatches41.firebaseio.com" + path);
    } else if (id >=400000 && id < 410000) {
      return new Firebase("https://tennismatches40.firebaseio.com" + path);
    } else if (id >=390000 && id < 400000) {
      return new Firebase("https://tennismatches39.firebaseio.com" + path);
    } else if (id >=360000 && id < 390000) {
      return new Firebase("https://tennismatches36.firebaseio.com" + path);
    } else if (id >=330000 && id < 360000) {
      return new Firebase("https://tennismatches33.firebaseio.com" + path);
    } else if (id >=300000 && id < 330000) {
      return new Firebase("https://tennismatches30.firebaseio.com" + path);
    } else if (id >=270000 && id < 300000) {
      return new Firebase("https://tennismatches27.firebaseio.com" + path);
    } else if (id >=240000 && id < 270000) {
      return new Firebase("https://tennismatches24.firebaseio.com" + path);
    } else if (id >=210000 && id < 240000) {
      return new Firebase("https://tennismatches21.firebaseio.com" + path);
    } else if (id >=180000 && id < 210000) {
      return new Firebase("https://tennismatches18.firebaseio.com" + path);
    } else if (id >=150000 && id < 180000) {
      return new Firebase("https://tennismatches15.firebaseio.com" + path);
    } else if (id >=120000 && id < 150000) {
      return new Firebase("https://tennismatches12.firebaseio.com" + path);
    } else if (id >=90000 && id < 120000) {
      return new Firebase("https://tennismatches09.firebaseio.com" + path);
    } else if (id >=60000 && id < 90000) {
      return new Firebase("https://tennismatches06.firebaseio.com" + path);
    } else if (id >=30000 && id < 60000) {
      return new Firebase("https://tennismatches03.firebaseio.com" + path);
    } else if (id >= 0 && id < 30000) {
      return new Firebase("https://tennismatches00.firebaseio.com" + path);
    }
    return new Firebase(this.baseUrl+path);
  },
  getRef: function(path) {
    if (path && path[0] != '/') {
      path = "/" + path;
    } else {
      path = "";
    }
    if (path.indexOf("/web/data/simpleusers") >= 0) {
      return new Firebase("https://tennisladders.firebaseio.com" + path);
    }
    if (path.indexOf("/web/data/matches/nm:") == 0 ||
        path.indexOf("/web/data/teammatches/ntm:") == 0) {
      return this.getNRef(path);
    }
    if (path.indexOf("/web/data/teams/nt:") == 0) {
      var id = parseInt(path.split("/")[4].split(":")[1]);
      if (id >= 100000) {
        return new Firebase("https://tennismatches30.firebaseio.com" + path);
      } else if (id >= 90000 && id < 100000) {
        return new Firebase("https://tennismatches27.firebaseio.com" + path);
      } else if (id >= 80000 && id < 90000) {
        return new Firebase("https://tennismatches24.firebaseio.com" + path);
      } else if (id >= 70000 && id < 80000) {
        return new Firebase("https://tennismatches21.firebaseio.com" + path);
      } else if (id >= 60000 && id < 70000) {
        return new Firebase("https://tennismatches18.firebaseio.com" + path);
      } else if (id >= 50000 && id < 60000) {
        return new Firebase("https://tennismatches15.firebaseio.com" + path);
      } else if (id >= 40000 && id < 50000) {
        return new Firebase("https://tennismatches12.firebaseio.com" + path);
      } else if (id >= 30000 && id < 40000) {
        return new Firebase("https://tennismatches09.firebaseio.com" + path);
      } else if (id >= 20000 && id < 30000) {
        return new Firebase("https://tennismatches06.firebaseio.com" + path);
      } else if (id >= 10000 && id < 20000) {
        return new Firebase("https://tennismatches03.firebaseio.com" + path);
      } else if (id >= 0 && id < 10000) {
        return new Firebase("https://tennismatches00.firebaseio.com" + path);
      }
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
    // remove player
    var users = roster ? roster.split(",") : [];
    console.log(roster, ladder)
    for (let player in ladder.users) {
      if (users.indexOf(player) < 0) {
        let ref = this.getRef("web/data/users/"+player+"/ladders/"+ladder.id);
        ref.remove();
      }
    }

    var ref = this.getRef("web/data/ladders/"+ladder.id+"/users");
    var players = {}
    for (let i in users) {
      players[users[i]] = users[i];
      if (!ladder.users[users[i]]) {
        let p = this.getRef("web/data/users/"+users[i]+"/ladders/"+ladder.id+"/date");
        p.set(window.now());
      }
    }
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
    m["time"] = window.now(match.matchMoment.unix()*1000);

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

    if (match.tmId) {
      m["tmId"] = match.tmId;
      let Ref = this.getRef("web/data/teammatches/"+match.tmId+"/matches/"+matchId);
      Ref.set(m);
    }

    m["creator"] = this.authUid;
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
    console.log(match)
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
      var id = Caching.getDisplayName(this.authUid);
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
        var ref = new Firebase('https://tennisladders.firebaseio.com/web/data/logs/visitlog/'+window.now()+"-"+id);
        ref.set(log);
      }
      var logRef = new Firebase('https://tennisladders.firebaseio.com/web/data/logs/'+type+"/"+(subtype ? subtype+"/" : "")+id+"/"+window.now());
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
    ref.orderByChild("usta").equalTo(usta).limitToFirst(5).once('value', function(snapshot) {
      var oldUsers = snapshot.val();
      var oldUserId = null;
      for (let id in oldUsers) {
        if (id.indexOf("n:") == 0) {
          oldUserId = id;
          break;
        }
      }
      if (!oldUsers || !oldUserId) {
        alert("not found");
        return;
      }

      var oldUser = oldUsers[oldUserId];
      console.log(oldUsers)
      if (oldUser.claimerId) {
        alert("account already been claimed by "+oldUser.claimerId);
        return;
      }
      delete oldUser.teams;
      delete oldUser.matches;
      delete oldUser.ladders;
      console.log(oldUser)
      window.Fbase.getRef("web/data/users/"+toId).update(oldUser);
      window.Fbase.getRef("web/data/users/"+toId+"/merges/"+oldUserId).set(oldUserId);
      window.Fbase.getRef("web/data/users/"+oldUserId+"/claimerId").set(toId);
      window.Fbase.getRef("web/data/simpleusers/"+toId).remove();
      window.Fbase.getRef("web/data/simpleusers/"+oldUserId).remove();

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
  createPic: function(matchId, matches, picId, picUrl, type, teamIds) {
    var baseRef = this.getRef("web/data/"+(teamIds ? "team" : "")+"matches/" + matchId + '/comments/' + picId);
    // console.log(matchId, matches, picUrl, picId, type, teamIds)
    var pic = {
      URL: picUrl,
      type: type,
      creator: this.authUid,
      createdTime: window.now(),
      matchId: matchId
    }
    baseRef.update(pic);

    for (let id in teamIds) {
      this.getRef("web/data/teams/"+teamIds[id]+"/pics/"+picId).update(pic);
    }

    for (let i in matches) {
      for (let p in matches[i].players) {
        this.getRef("web/data/users/"+matches[i].players[p]+"/pics/"+picId).update(pic);
      }
    }
    this.log("create picture", "write", "createPic");
  },
  createPicThumb:function(matchId, matches, picId, exif, thumbUrl, type, teamIds) {
    // console.log("web/data/"+(teamIds ? "team" : "")+"matches/" + matchId + '/comments/' + picId)
    // return;
    var baseRef = this.getRef("web/data/"+(teamIds ? "team" : "")+"matches/" + matchId + '/comments/' + picId);
    var thumb = {
      thumbURL:thumbUrl,
      type:type,
      creator:this.authUid,
      createdTime:window.now(),
      exif:exif
    };
    baseRef.update(thumb);

    for (let id in teamIds) {
      this.getRef("web/data/teams/"+teamIds[id]+"/pics/"+picId).update(thumb);
    }
    for (let i in matches) {
      for (let p in matches[i].players) {
        this.getRef("web/data/users/"+matches[i].players[p]+"/pics/"+picId).update(thumb);
      }
    }
    this.log("create thumb", "write", "createThumb");
  },
  updateVideoTitle:function(matchId, matches, commentId, videoTitle, teamIds) {
    var key = "web/data/matches/" + matchId + '/comments/' + commentId + "/title";
    if (teamIds) {
      key = "web/data/teammatches/" + matchId + '/comments/' + commentId + "/title";
      for (let id in teamIds) {
        this.getRef("web/data/teams/"+teamIds[id]+"/pics/"+commentId+"/title").set(videoTitle);
      }
    }
    var ref = this.getRef(key);
    ref.set(videoTitle);

    for (let i in matches) {
      for (let p in matches[i].players) {
        this.getRef("web/data/users/"+matches[i].players[p]+"/pics/"+commentId+"/title").set(videoTitle);
      }
    }
    this.log(key, "write", "createVideoTitle");
  },
  createComment: function(matchId, comment, type, isTeamMatch) {
    var commentId = "comment:"+window.now()+":"+this.authUid;
    var key = "web/data/matches/" + matchId + '/comments/' + commentId;
    if (isTeamMatch) {
      key = "web/data/teammatches/" + matchId + '/comments/' + commentId
    }
    // console.log(key)
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
  },
  updateTeamStats(teamId, stats) {
    var ref = this.getRef("web/data/teams/"+teamId+"/stats");
    ref.set(stats);
  },
  updatePlayerLadders(uid, ladders) {
    var ref = this.getRef("web/data/simpleusers/"+uid+"/ladders");
    ref.set(ladders);
  },
  print(path) {
    this.getRef(path).once("value", function(s) {
      console.log(s.val());
    })
  },
};
