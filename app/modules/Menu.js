import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import PlayerDetails from './PlayerDetails';
import LadderOverview from './LadderOverview';
var Dropzone = require('react-dropzone');

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
    this.onUpload = this.onUpload.bind(this);
    this.onTestButtonClick = this.onTestButtonClick.bind(this);
    this.onBeforeChange = this.onBeforeChange.bind(this);
  }

  authDataCallback(authData) {
    if (!authData) {
      var ref = window.Fbase.getRef();
      ref.authWithOAuthRedirect("facebook", function (error) {
        console.log("Login Failed!", error);
      });
    }
    else {
      console.log("Authenticated successfully with payload:", authData);
    }
  }
  logout() {
    var ref = window.Fbase.getRef();
    ref.unauth();
    location.reload();
  }

  updatePlayer(lines) {
    var completed = 0;
    var requested = 0;
    for(var line = 1; line < lines.length; line++){
      var field = lines[line].split(";");
      if (!field[1]) continue;
      var player = {
        norcal: field[0],
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
        var ref = window.Fbase.getRef("web/data/users/norcal:"+field[0]);
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
  }

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
      var ref = window.Fbase.getRef("web/data/ladders/norcalladder:"+field[0]);
      var ladder = {
        norcal: field[0],
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
  }

  updateLeagueTeam(lines) {
    var completed = 0;
    var requested = 0;
    for(var line = 1; line < lines.length; line++){
      var field = lines[line].split(";");
      if (field.length < 10 || field[1].indexOf("JTT") >=0) {
        console.log(field)
        break;
      }
      requested++;
      if (requested % 100 == 0) {
        console.log("requested: ", requested);
      }
      var ref = window.Fbase.getRef("web/data/ladders/norcalladder:"+field[0]+"/teams");
      var team = {};
      team["norcalteam:"+field[2]] = "norcalteam:"+field[2];
      ref.update(team);
      team = {
        norcal: field[2],
        ladderId: "norcalladder:"+field[0],
        displayName: field[3],
        displayName_: field[3].toLowerCase(),
        captainId: "norcal:"+field[4],
        city: field[6],
        area: field[7],
        orgId: field[8],
        org: field[9]
      };
      ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[2]);
      ref.update(team, function(error) {
        if (error) {
          console.log(error);
        } else {
          completed++;
          if (completed % 100 == 0) console.log(window.now()+"complete:" + completed)
        }
      });
    }
  }

  updateTeamPlayer(lines) {
    var completed = 0;
    var requested = 0;
    for(var line = 6000; line < 8000; line++){
      var field = lines[line].split(";");
      if (field.length < 2 || !field[1]) continue;

      var players = {};
      var ids = field[1].split(",");
      for (let i in ids) {
        if (ids[i]) {
          requested++;
          if (requested % 100 == 0) {
            console.log("requested: ", requested);
          }
          let t = {};
          t["norcalteam:"+field[0]] = "norcalteam:"+field[0];
          players["norcal:"+ids[i]] = "norcal:"+ids[i];
          let r = window.Fbase.getRef("web/data/users/norcal:"+ids[i]+"/teams");
          r.update(t, function(err) {
            if (err) {
              console.log(err);
            } else {
              completed++;
              if (completed % 100 == 0) console.log(window.now()+" complete:" + completed)
            }
          });
        }
      }
      requested++;
      if (requested % 100 == 0) {
        console.log("requested: ", requested);
      }
      var ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[0]+"/players");
      ref.set(players, function(err) {
        if (err) {
          console.log(err);
        } else {
          completed++;
          if (completed % 100 == 0) console.log(window.now()+" complete:" + completed)
        }
      });
    }
  }

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
        var ref = window.Fbase.getRef("web/data/teammatches/norcalteammatch:"+field[0]);
        requested++;
        var teamMatch = {
          teams: ["norcalteam:"+field[1], "norcalteam:"+field[2]],
          status: "completed",
          matchTime: window.now(new Date(field[6]).getTime())
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
        ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[1]+"/matches/norcalteammatch:"+field[0]+"/teamId");
        requested++;
        ref.set("norcalteam:"+field[2], function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });
        ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[2]+"/matches/norcalteammatch:"+field[0]+"/teamId");
        requested++;
        ref.set("norcalteam:"+field[1], function(err) {
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
        teamMatchId: "norcalteammatch:"+field[0],
        scores: [],
        players: [],
        status: "completed",
        matchDate: window.now(new Date(field[6]).getTime())
      }
      var scores = field[4].split(",");
      for (let s in scores) {
        match.scores.push(scores[s].split("-"));
      }
      for (let p in players) {
        match.players.push("norcal:"+players[p]);
      }
      ref = window.Fbase.getRef("web/data/matches/norcalmatch:"+field[0]+":"+field[3]);
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
      ref = window.Fbase.getRef("web/data/teammatches/norcalteammatch:"+field[0]+"/matches/norcalmatch:"+field[0]+":"+field[3]);
      requested++;
      ref.set("norcalmatch:"+field[0]+":"+field[3], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateScores(lines, start + batch);
          }
        }
      });

      // link match to player

      for (let p in players) {
        ref = window.Fbase.getRef("web/data/users/norcal:"+players[p]+"/matches/norcalmatch:"+field[0]+":"+field[3]);
        requested++;
        ref.set("norcalmatch:"+field[0]+":"+field[3], function(err) {
          if (!err) {
            completed++;
            if (completed == requested) {
              self.updateScores(lines, start + batch);
            }
          }
        });
      }
    }
  }

  updateTeamMatch(lines, start) {
    var requested = 0;
    var completed = 0;
    var batch = 100;
    var self = this;
    console.log("teammatch starting:", start);
    for (let i = 0; i < batch && start+i < lines.length; i++) {
      var field = lines[i+start].split(";");
      var ref = window.Fbase.getRef("web/data/teammatches/norcalteammatch:"+field[0]);
      requested++;
      var teamMatch = {
        teams: ["norcalteam:"+field[1], "norcalteam:"+field[2]],
        status: field[4],
      };
      if (new Date(field[3]) != "Invalid Date") {
        teamMatch["matchTime"] = window.now(new Date(field[3]).getTime());
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
      ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[1]+"/matches/norcalteammatch:"+field[0]+"/teamId");
      requested++;
      ref.set("norcalteam:"+field[2], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamMatch(lines, start + batch);
          }
        }
      });
      ref = window.Fbase.getRef("web/data/teams/norcalteam:"+field[2]+"/matches/norcalteammatch:"+field[0]+"/teamId");
      requested++;
      ref.set("norcalteam:"+field[1], function(err) {
        if (!err) {
          completed++;
          if (completed == requested) {
            self.updateTeamMatch(lines, start + batch);
          }
        }
      });

      // merge pending match
    }
  }
  onUpload(files){
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
          self.updateLeagueTeam(lines);
          break;
        case "teamplayer":
          self.updateTeamPlayer(lines);
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
  }

  onTestButtonClick() {
    var ref = window.Fbase.getRef("web/data/matches");
    ref.once('value', function(data) {
      var d = data.val();
      for (let m in d) {
        var score = [];
        for (let s in d[m].scores) {
          score.push(d[m].scores[s].scores);
        }
        if (score) {
          var ref = window.Fbase.getRef("web/data/matches/"+m+"/scores");
          ref.set(score);
        }
      }
    })
    return;
    var obj = {ccc:1};
    window.Fbase.createObject("leagues", "", obj);
    console.log(obj)
    var data = [
    "190024;Maria E  Chamberlain;2010399900;03/31/2016;3.0;Livermore, CA;F"];
    // data.forEach(function(row){
    //   var p = row.split(";");
    //   if (true || p[4] != "na") {
    //     window.Fbase.createObject("users", "norcal:"+p[0],{
    //       norcal: p[0],
    //       displayName: p[1],
    //       usta: p[2],
    //       expirationDate: p[3],
    //       rating: p[4],
    //       residence: p[5],
    //     });
    //   }
    //   // console.log(p);
    // });

    var matches = [
   "match:2016-02-10-22-19-52-100:facebook:539060618",
   "match:2016-02-10-23-48-02-608:facebook:539060618"
    ]
    console.log("start", window.now())
    matches.forEach(function(m) {
      var ref = window.Fbase.getRef("web/data/matches/"+m);
      ref.once('value', function() {
        console.log("done",window.now())
      })
    });
    console.log("starting ", window.now());
    // var ref = window.Fbase.getRef("web/data/matches/match:1454970406422:facebook:539060618");
    var ref = window.Fbase.getRef("web/data/users/facebook:539060618");
    ref.once('value', function() {
      console.log("got data", window.now());
    })
  }
  onBeforeChange(index) {
    this.props.history.push("/"+index)
  }
  getTabIndex(value) {
    const tab_maps = {
      "ladder" : 1,
      "recent" : 2,
      "player" : 3,
      "create" : 4
    }
    var index = parseInt(value);
    if (index) {
      return index;
    }
    return tab_maps[value];
  }
  render() {
    // console.log("menu", this.props.params)
    return (
      <div className="container">
        <div className="page-header">
          <h2 className="titleText">Live Tennis Ladder</h2>
        </div>
        <Tabs tabActive={this.getTabIndex(this.props.params.tab)} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='Ladder'>
            <LadderOverview ladderId={this.props.params.ladderId} {...this.props} />
          </Tabs.Panel>
          <Tabs.Panel title="Recent">
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title="Player">
            <PlayerDetails playerId={this.props.params.playerId} {...this.props} />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
          {window.Fbase.authUid == window.Fbase.Henry &&
            <Tabs.Panel title='Create'>
              <MatchRecorder />
            </Tabs.Panel>
          }
          {window.Fbase.authUid == window.Fbase.Henry &&

              <Tabs.Panel title="Ad">
                <Dropzone onDrop={this.onUpload} className="pictureUpload">
                  <div>Try</div>
                </Dropzone>
                <button onClick={this.onTestButtonClick}>Test</button>
                <img src={this.state.file} className="player" />
                <div>from ID:<input ref="fromId"/></div>
                <div>to ID:<input ref="toId"/></div>

              </Tabs.Panel>

          }
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
