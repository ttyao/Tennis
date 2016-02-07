'use strict';

window.Fbase = {
  baseUrl : "https://blistering-torch-8342.firebaseio.com",
  authUid: function(){
    var ref = new Firebase(this.baseUrl);
    var authData = ref.getAuth();
    if (authData) {
      return authData["uid"];
    } else {
      return "";
    }
  },
  getRef: function(path) {
    if (path && path[0] != '/') {
      path = "/" + path;
    } else {
      path = "";
    }
    return new Firebase(this.baseUrl+path);
  },
  onceUserName: function(uid, callback) {
    var ref = this.getRef("web/data/users/"+uid);
    ref.once('value', function(snapshot) {
      callback(snapshot.val() ? snapshot.val().displayName : null);
    });
  },
  createUser: function(displayName, onComplete, caller){
    if (this.authUid()) {
      this.onceUserName("guest:"+displayName, function(username) {
        if (!username) {
          var ref = window.Fbase.getRef("web/data/users/guest:"+displayName);
          ref.set({
            creator: window.Fbase.authUid(),
            displayName: displayName
          }, function(error) {
            if(!error && onComplete) {
              onComplete.call(caller, error);
            }
          });
        } else if (onComplete) {
          onComplete.call(caller);
        }
      });
    }
  },
  createMatch: function(match) {
    var matches = {};
    var createdTime = Date.now();
    var matchId = "match:"+createdTime+":"+this.authUid();
    matches[matchId] = match;
    matches[matchId]["matchTime"] = match.matchTime.unix()*1000;
    matches[matchId]["creator"] = this.authUid();

    // There is no transaction support...

    // console.log(matches[matchId]);
    // return;
    for (var i in match.players) {
      var player = match.players[i];
      if (player) {
        let playerRef = this.getRef("web/data/users/"+player+"/matches/"+matchId);
        playerRef.set(matches[matchId]);
      }
    }

    var matchRef = this.getRef('web/data/matches/'+matchId);
    matchRef.set(matches[matchId], function(error) {
      if (error) {
        alert("Can't save match.");
        console.log(error);
      } else {
        location.reload();
      }
    });
  },
};
