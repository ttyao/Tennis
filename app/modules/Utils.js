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
    return moment(date).utcOffset(-8).format("YYYY-MM-DD");
  }
  return moment(date).utcOffset(-8).format("YYYY-MM-DD-HH-mm-ss-SSS");
};

window.Utils = {
  getDateString: function(time) {
    if (time.toString().indexOf('-') >= 0) {
      return moment(time).utcOffset(-8).format("MM/DD/YYYY");
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
  if (window.Fbase.isDebug()) {
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
            self.simplePlayers[i] = {
              displayName: data.displayName,
              ntrp: data.ntrp,
            }
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
          window.Caching.ladders[team.ladderId] = "pending";
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
            if (user.claimerId) {
              ref = window.Fbase.getRef("web/data/users/"+user.claimerId);
              ref.once('value', function(snap) {
                var claimer = snap.val();
                if (claimer) {
                  window.Caching.simplePlayers[uid] = {
                    claimerId: user.claimerId,
                    displayName: claimer.displayName,
                    ntrp: claimer.ntrp || ""
                  };
                  window.Fbase.getRef("web/data/simpleusers/"+uid).set(window.Caching.simplePlayers[uid]);
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
            } else {
              let s = {
                displayName: user.displayName,
                ntrp: user.ntrp || ""
              }
              window.Caching.simplePlayers[uid] = s;
              window.Fbase.getRef("web/data/simpleusers/"+uid).set(s);
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
    if (!uid) {
      if (callback) {
        callback(null);
      }
      return null;
    }
    if (this.simplePlayers[uid]) {
      if (callback) {
        callback(this.simplePlayers[uid]);
      }
    }
    this.loadSimplePlayer(uid, callback);
    return "pending";
  },
}
