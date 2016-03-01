import React from 'react';
var Dropzone = require('react-dropzone');

var NorcalSync = React.createClass({
  updatePlayer(lines) {
    var completed = 0;
    var requested = 0;
    for(var line = 1; line < lines.length; line++){
      var field = lines[line].split(";");
      if (!field[1]) continue;
      var player = {
        n: field[0],
        displayName: field[1],
        displayName_: field[1].toLowerCase(),
        usta: field[2],
        expiration: field[3],
        ntrpYear: field[4],
        ntrpType: field[5],
        ntrp: parseFloat(field[6]) > 0 ? parseFloat(field[6]) : null,
        residence: field[7],
        gender: field.length > 7 && field[8].length > 0 ? field[8][0] : "U"
      };
      if (player.ntrp) {
        requested++;
        if (requested % 100 == 0) {
          console.log("requested: ", requested);
         // console.log(lines[line])
        }
        var ref = window.Fbase.getRef("web/data/users/n:"+field[0]);
        ref.update(player, function(error) {
          if (error) {
            console.log(error);
          } else {
            completed++;
            if (completed % 100 == 0) console.log("complete:" + completed)
          }
        });
      }
    }
  },

  updateLadder(lines) {
    var area =['DN', 'DS', 'EB', 'FA',
               'LP', 'MA', 'MB', 'MP',
               'NS', 'RT', 'SA', 'SB',
               'SF', 'SM', 'UP'];
    var completed = 0;
    var requested = 0;
    for(var line = 1; line < lines.length; line++){
      var field = lines[line].split(";");
      if (field.length < 2 || field[1].indexOf("JTT") >=0) continue;
      requested++;
      if (requested % 100 == 0) {
        console.log("requested: ", requested);
      }
      var ref = window.Fbase.getRef("web/data/ladders/nl:"+field[0]);
      var ladder = {
        n: field[0],
        displayName: field[1],
        displayName_: field[1].toLowerCase(),
        type: field[2],
        gender: field[3],
        age: field[4],
        level: field[5]
      };
      ref.update(ladder, function(error) {
        if (error) {
          console.log(error);
        } else {
          completed++;
          if (completed % 100 == 0) console.log("complete:" + completed)
        }
      });
    }
  },

  updateLeagueTeam(lines, start) {
    var requested = 0;
    var completed = 0;
    var batch = 100;
    var self = this;
    console.log("leagueteam starting:", start);
    for (let i = 0; i < batch && start+i < lines.length; i++) {
      var field = lines[i + start].split(";");
      if (field.length < 10 || field[1].indexOf("JTT") >=0) {
        console.log(field)
        break;
      }
      requested++;
      var ref = window.Fbase.getRef("web/data/ladders/nl:"+field[0]+"/teams");
      var team = {};
      team["nt:"+field[2]] = {
        area:field[7],
        displayName: field[3]
      };
      ref.update(team, function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateLeagueTeam(lines, start + batch);
          }
        }
      });
      team = {
        n: field[2],
        ladderId: "nl:"+field[0],
        displayName: field[3],
        displayName_: field[3].toLowerCase(),
        captainId: "n:"+field[4],
        city: field[6],
        area: field[7],
        orgId: field[8],
        org: field[9]
      };
      requested++;
      ref = window.Fbase.getRef("web/data/teams/nt:"+field[2]);
      ref.update(team, function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateLeagueTeam(lines, start + batch);
          }
        }
      });
    }
  },

  updateTeamPlayer(lines, start) {
    var requested = 0;
    var completed = 0;
    var batch = 100;
    var self = this;
    console.log("teamplayer starting:", start);
    for (let i = 0; i < batch && start+i < lines.length; i++) {
      var field = lines[i+start].split(";");
      var ref = window.Fbase.getRef("web/data/users/n:"+field[1]+"/teams/nt:"+field[0]);
      requested++;
      var rating = {
        ntrp: field[2],
        date: field[3],
      };
      // console.log(field)
      ref.set(rating, function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamPlayer(lines, start + batch);
          }
        }
      });
      ref = window.Fbase.getRef("web/data/teams/nt:"+field[0]+"/users/"+field[1]);
      requested++;
      // console.log(field)
      ref.set("1", function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamPlayer(lines, start + batch);
          }
        }
      });
    }
  },

  updateScores(lines, start) {
    var requested = 0;
    var completed = 0;
    var batch = 100;
    var self = this;
    console.log("scores starting:", start);
    for (let i = 0; i < batch && start+i < lines.length; i++) {
      var field = lines[i+start].split(";");
      if (field.length < 2) continue;
      // update teammatch info
      if (field[3] == 1) {
        var ref = window.Fbase.getRef("web/data/teammatches/ntm:"+field[0]);
        requested++;
        var teamMatch = {
          teams: ["nt:"+field[1], "nt:"+field[2]],
          status: "completed",
          time: window.now(new Date(field[6]).getTime(), true),
          matchTime: null
        };
        // console.log(teamMatch);

        ref.update(teamMatch, function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });
        ref = window.Fbase.getRef("web/data/teams/nt:"+field[1]+"/matches/ntm:"+field[0]+"/teamId");
        requested++;
        ref.set("nt:"+field[2], function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });
        ref = window.Fbase.getRef("web/data/teams/nt:"+field[2]+"/matches/ntm:"+field[0]+"/teamId");
        requested++;
        ref.set("nt:"+field[1], function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });

        // remove pending match data
        // TODO
      }

      // create match
      var players = field[5].split(",");
      var match = {
        line: field[3],
        tmId: "ntm:"+field[0],
        teamMatchId: null,
        scores: [],
        players: [],
        status: "completed",
        matchTime: null,
        time: window.now(new Date(field[6]).getTime(), true)
      }
      var scores = field[4].split(",");
      for (let s in scores) {
        match.scores.push(scores[s].split("-"));
      }
      for (let p in players) {
        match.players.push("n:"+players[p]);
      }
      ref = window.Fbase.getRef("web/data/matches/nm:"+field[0]+":"+field[3]);
      requested++;
      ref.update(match, function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateScores(lines, start + batch);
          }
        }
      });

      // link match to teammatch
      ref = window.Fbase.getRef("web/data/teammatches/ntm:"+field[0]+"/matches/nm:"+field[0]+":"+field[3]);
      requested++;
      ref.set("nm:"+field[0]+":"+field[3], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateScores(lines, start + batch);
          }
        }
      });

      // link match to player

      for (let p in players) {
        ref = window.Fbase.getRef("web/data/users/n:"+players[p]+"/matches/nm:"+field[0]+":"+field[3]);
        requested++;
        ref.set({time:match.time}, function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });
      }
    }
  },

  updateTeamMatch(lines, start) {
    var requested = 0;
    var completed = 0;
    var batch = 100;
    var self = this;
    console.log("teammatch starting:", start);
    for (let i = 0; i < batch && start+i < lines.length; i++) {
      var field = lines[i+start].split(";");
      var ref = window.Fbase.getRef("web/data/teammatches/ntm:"+field[0]);
      requested++;
      var teamMatch = {
        teams: ["nt:"+field[1], "nt:"+field[2]],
        status: field[4],
      };
      if (new Date(field[3]) != "Invalid Date") {
        teamMatch["time"] = window.now(new Date(field[3]).getTime(), true);
      }
      // console.log(teamMatch);

      ref.update(teamMatch, function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamMatch(lines, start + batch);
          }
        }
      });
      ref = window.Fbase.getRef("web/data/teams/nt:"+field[1]+"/matches/ntm:"+field[0]+"/teamId");
      requested++;
      ref.set("nt:"+field[2], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamMatch(lines, start + batch);
          }
        }
      });
      ref = window.Fbase.getRef("web/data/teams/nt:"+field[2]+"/matches/ntm:"+field[0]+"/teamId");
      requested++;
      ref.set("nt:"+field[1], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamMatch(lines, start + batch);
          }
        }
      });

      // merge pending match
    }
  },
  onUpload(files){
    console.log(files)
    var reader = new FileReader();
    var self = this;
    reader.onload = function(event) {
      var lines = this.result.split('\n');
      console.log(lines[0])
      switch (lines[0]) {
        case "league":
          self.updateLadder(lines);
          break;
        case "team":
          self.updateTeam(lines);
          break;
        case "leagueteam":
          self.updateLeagueTeam(lines, 1);
          break;
        case "teamplayer":
          self.updateTeamPlayer(lines, 1);
          break;
        case "player":
          self.updatePlayer(lines);
          break;
        case "teammatch":
          self.updateTeamMatch(lines, 1);
          break;
        case "score":
          self.updateScores(lines, 1);
          break;
      }
    };
    reader.readAsText(files[0]);
  },
  render() {
    return (
      <Dropzone onDrop={this.onUpload} className="pictureUpload">
        <div>Sync</div>
      </Dropzone>
    )
  }
});

module.exports = NorcalSync;
