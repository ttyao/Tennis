import moment from 'moment';
require("setimmediate");

window.now = function(date, onlyDate) {
  if (date === '' || date === false || date === null) {
    date = null;
  } else {
    if (parseInt(date) > 315532800) { // 1980/1/1
        date = parseInt(date);
        if (date < 315532800000) { // convert to millisec
            date *= 1000
        }
    }
    if (!typeof date === "number") {
      if (date.toJSON) {
          date = date.toJSON();
      } else {
          date = date.toString();
      }
      var t = date.split(/[:\-TZ\. ]/);
      for (var i in t) {
          if (t[i] !== '' && isNaN(parseInt(t[i], 10))) return false;
      }
      while (t.length < 7) {
        t.push(0);
      }

      var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5], t[6]);

      date = d.getTime();
    }
  }
  if (onlyDate) {
    return moment(date).utcOffset(-7).format("YYYY-MM-DD");
  }
  return moment(date).utcOffset(-7).format("YYYY-MM-DD-HH-mm-ss-SSS");
};

window.Utils = {
  getDateString: function(time) {
    if (time.toString().indexOf('-') >= 0) {
      return moment(time).utcOffset(-7).format("MM/DD/YYYY");
    } else {
      return new Date(time).toLocaleDateString();
    }
  },
  equals: function(obj1, obj2) {
    var type1 = typeof(obj1);
    var type2 = typeof(obj2);
    if (type1 != type2) {
      return false;
    }
    if (type1 == "number" || type1 == "string" || type1 == "boolean" || type1 == "undefined") {
      return obj1 == obj2;
    }
    if (type1 == "object") {
      if (Object.keys(obj1).length != Object.keys(obj2).length) {
        return false;
      }
      for (let key in obj1) {
        if (!this.equals(obj1[key], obj2[key])) {
          return false;
        }
      }
      return true;
    }
    console.log("can't compare:", obj1, obj2);
  }
}

window.GoogleAnalytics = function() {
  if (Fbase.authUid == Fbase.Henry || Fbase.isDebug()) {
    return;
  }
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-74582373-1', 'auto');
  // ga('require', 'linkid');
  ga('set', 'userId', window.Fbase.authUid); // Set the user ID using signed-in user_id.
  ga('send', 'pageview');
}

window.Caching = {
  players : {},
  simplePlayers: {},
  matches: {},
  teams: {},
  ladders: {},
  playerLadders: {},
  loadPlayers: function() {
    for (let i in this.players) {
      if (this.players[i] == "pending") {
        console.log("warming up player: " + i, window.now().slice(11))
        var player = window.Fbase.getRef("web/data/users/"+i);
        var self = this;
        player.once("value", function(snapshot) {
          var data = snapshot.val();
          if (data) {
            self.players[i] = data;
            if (i == Fbase.authUid) {
              Fbase.getRef("web/data/users/"+i).update({visits: data.visits ? data.visits + 1 : 1, loggedInAt: window.now()});
              for (let m in data.merges) {
                Fbase.authUids.push(m);
              }
            }
            // if (typeof(self.simplePlayers[i]) != "object") {
            //   self.simplePlayers[i] = {
            //     displayName: data.displayName,
            //     ntrp: data.ntrp,
            //     ntrpType: data.ntrpType,
            //     claimerId: data.claimerId,
            //     tdb: data.ratings ? data.ratings['2015'] : "",
            //   }
            //   console.log(i,data)
            // }
            for (let m in data.matches) {
              self.matches[m] = "pending";
            }
            for (let t in data.teams) {
              self.teams[t] = "pending";
            }
            for (let l in data.ladders) {
              self.ladders[l] = "pending";
            }
            self.loadMatches();
            self.loadTeams();
            self.loadLadders();
            if (data.merges) {
              for (let i in data.merges) {
                self.players[i] = "pending";
              }
            }
          } else {
            self.players[i] = "not found";
          }
          self.loadPlayers();
        })
        return;
      }
    }
  },
  loadMatches: function() {
    for (let i in this.matches) {
      if (this.matches[i] == "pending") {
        var ref = window.Fbase.getRef("web/data/matches/"+i);
        ref.once('value', function(snap) {
          window.Caching.matches[i] = snap.val();
          window.Caching.loadMatches();
        })
        return;
      }
    }
  },
  loadTeams: function() {
    for (let i in this.teams) {
      if (this.teams[i] == "pending") {
        var ref = window.Fbase.getRef("web/data/teams/"+i);
        ref.once('value', function(snap) {
          var team = snap.val();
          window.Caching.teams[i] = team;
          window.Caching.loadTeams();
          if (!window.Caching.ladders[team.ladderId]) {
            window.Caching.ladders[team.ladderId] = "pending";
          }
        })
        return;
      }
    }
  },
  loadLadders: function() {
    for (let i in this.ladders) {
      if (this.ladders[i] == "pending") {
        var ref = window.Fbase.getRef("web/data/ladders/"+i);
        ref.once('value', function(snap) {
          window.Caching.ladders[i] = snap.val();
          window.Caching.loadLadders();
        })
        return;
      }
    }
    window.setTimeout(function() {window.Caching.loadLadders();}, 10);
  },
  loadSimplePlayer: function(uid, callback) {
    if (!uid  || uid == "n:0" || uid == "n:") {
      if (callback) {
        callback(null);
      }
      return null;
    }
    var ref = window.Fbase.getRef("web/data/simpleusers/"+uid);
    ref.once('value', function(snap) {
      var u = snap.val();
      if (u) {
        window.Caching.simplePlayers[uid] = u;
        if (callback) {
          callback(u);
        }
      } else {
        ref = window.Fbase.getRef("web/data/users/"+uid);
        ref.once('value', function(snap) {
          var user = snap.val();
          if (user) {
            if (user.merges) {
              let mergerId = null;
              for (let id in user.merges) {
                if (id.indexOf("n:") == 0) {
                  mergerId = id;
                  break;
                }
              }
              if (mergerId) {
                ref = window.Fbase.getRef("web/data/users/"+mergerId);
                ref.once('value', function(snap) {
                  var merger = snap.val();
                  if (merger) {
                    window.Caching.simplePlayers[uid] = {
                      mergerId: mergerId,
                      displayName: merger.displayName || "",
                      ntrp: merger.ntrp || "",
                      ntrpType: merger.ntrpType || "",
                      claimerId: user.claimerId || "",
                      tdb: merger.ratings ? merger.ratings['2015'].toFixed(2) : "",
                    };

                    window.Fbase.getRef("web/data/simpleusers/"+uid).update(window.Caching.simplePlayers[uid]);
                    if (callback) {
                      callback(window.Caching.simplePlayers[uid]);
                    }
                  } else {
                    window.Caching.simplePlayers[uid] = "not found";
                    if (callback) {
                      callback(window.Caching.simplePlayers[uid]);
                    }
                  }
                });
              }

            } else {
              let s = {
                displayName: user.displayName || "",
                ntrp: user.ntrp || "",
                ntrpType: user.ntrpType || "",
                claimerId: user.claimerId || "",
                // hard code to 2015 rating
                tdb: user.ratings ? user.ratings['2015'].toFixed(2) : "",
              }
              window.Caching.simplePlayers[uid] = s;
              window.Fbase.getRef("web/data/simpleusers/"+uid).update(s);
              if (callback) {
                callback(window.Caching.simplePlayers[uid]);
              }
            }
          } else {
            window.Caching.simplePlayers[uid] = "not found";
            if (callback) {
              callback(window.Caching.simplePlayers[uid]);
            }
          }
        });
      }
    })
  },
  loadSimplePlayers: function() {
    for (let i in this.simplePlayers) {
      if (this.ladders[i] == "pending") {
        this.loadSimplePlayer(i);
        break;
      }
    }
    window.setTimeout(function() {window.Caching.loadLadders();}, 100);
  },
  getSimplePlayer: function(uid, callback) {
    if (!uid || uid == "n:0" || uid == "n:") {
      if (callback) {
        callback(null);
      }
      return null;
    }
    if (this.simplePlayers[uid]) {
      if (callback) {
        callback(this.simplePlayers[uid]);
      }
      return this.simplePlayers[uid];
    }
    this.loadSimplePlayer(uid, callback);
    return "pending";
  },
  setSimplePlayer: function(uid, player) {
    this.simplePlayers[uid] = player;
  },
  getNameAndRating: function(uid) {
    // assume it is loaded.
    if (typeof(this.simplePlayers[uid]) != 'object') {
      return "loading...";
    }
    let rating = this.simplePlayers[uid].tdb;
    if (!rating) {
      rating = this.simplePlayers[uid].ntrp + this.simplePlayers[uid].ntrpType;
    }
    return this.simplePlayers[uid].displayName + " (" + rating + ")";
  },
  getDisplayName: function(uid, callback) {
    if (!uid || uid == "n:0" || uid == "n:") {
      if (callback) {
        callback(null);
      }
      return null;
    }
    if (typeof(this.simplePlayers[uid]) == "object") {
      if (callback) {
        callback(this.simplePlayers[uid].displayName);
      }
      return this.simplePlayers[uid].displayName;
    } else if (this.simplePlayers[uid]) {
      if (callback) {
        callback(this.simplePlayers[uid]);
      }
      return this.simplePlayers[uid];
    }
    this.loadSimplePlayer(uid, function(player) {
      if (callback) {
        if (typeof(player) == "object") {
          callback(player.displayName);
        } else {
          callback(player)
        }
      }
    });
    return "pending";
  },
  getPlayerId: function(displayName) {
    for (var key in this.simplePlayers) {
      if (typeof(this.simplePlayer) == "object" && this.simplePlayers[key].displayName == displayName) {
        return key;
      }
    }
    return displayName;
  },
  initLadders: function(uid) {
    if (typeof(this.players[uid]) == "object") {
      let loaded = true;
      for (let i in this.players) {
        if (this.players[i] == "pending") {
          loaded = false;
          break;
        }
      }
      for (let i in this.teams) {
        if (this.teams[i] == "pending") {
          loaded = false;
          break;
        }
      }
      for (let i in this.ladders) {
        if (this.ladders[i] == "pending") {
          loaded = false;
          break;
        }
      }
      if (loaded) {
        this.playerLadders[uid] = [];
        var uids = [uid];
        for (let merge in this.players[uid].merges) {
          uids.push(merge);
        }
        var ladders = {};
        for (let uid in uids) {
          for (let l in this.players[uids[uid]].ladders) {
            ladders[l] = ({ladderId:l, ladder:this.ladders[l]});
          }
          for (let t in this.players[uids[uid]].teams) {
            ladders[this.teams[t].ladderId] = ({ladderId : this.teams[t].ladderId, ladder:this.ladders[this.teams[t].ladderId]});
          }
        }
        Fbase.log("time to load inital: " + (new Date() - Fbase.startTime)/1000+" sec", "perf", "init");
        let visited = {};
        for (let i in ladders) {
          let candidate = -1;
          for (let j in ladders) {
            if (!visited[j] && (candidate == -1 || ladders[j].ladder.displayName_ > ladders[candidate].ladder.displayName_)) {
              candidate = j
            }
          }
          visited[candidate] = true
          delete ladders[candidate].ladder.teams
          this.playerLadders[uid].push(ladders[candidate]);
        }
        Fbase.updatePlayerLadders(uid, this.playerLadders[uid]);
        return;
      }
    }
    window.setTimeout(function() {window.Caching.initLadders(uid);}, 10);
  },
}
