import React from 'react';
var Dropzone = require('react-dropzone');
window.Rating = {
getCurrentRating(uid, date) {
    let thisYear = this.getYearEndRating(uid, date.getFullYear());
    let lastYear = this.getYearEndRating(uid, date.getFullYear()-1);

    this.users[uid].currentRatingDate = date
    if (thisYear == lastYear) {
      this.users[uid].currentRating = thisYear - 0.25;
    } else {
      if (lastYear < thisYear) {
        this.users[uid].currentRating = thisYear - 0.4;
      } else {
        this.users[uid].currentRating = thisYear - 0.1;
      }
    }
  },
  adjustRating(players, matchDate, score, ratingParams) {
    if (players[0] == "0" || players[1] == "0") return;
    var sets = score.split(",");
    var scores = [];
    var setWin = 0;
    var gameWin = 0;
    for (let s in sets) {
      let set = sets[s].split("-");
        if (set[0] < set[1]) {
          setWin--;
        } else if (set[0] > set[1]) {
          setWin++;
        }
        gameWin += set[0] - set[1];
      scores.push(set);
    }
    for (let p in players) {
      if (!this.users[players[p]]) {
        return;
      }
      if (!this.users[players[p]].currentRating) {
        this.getCurrentRating(players[p], matchDate);
      }
    }
    var currentRatingA = this.users[players[0]].currentRating;
    var currentRatingB = this.users[players[1]].currentRating;
    if (players[2] && players[3]) {
      currentRatingA = (currentRatingA + this.users[players[2]].currentRating) / 2.0;
      currentRatingB = (currentRatingB + this.users[players[3]].currentRating) / 2.0;
    }
    var newRatingA = currentRatingA;
    var newRatingB = currentRatingB;
    var weakWinFactor = 1 + this.ratingParams.weakWinMultiplier * Math.abs(currentRatingB - currentRatingA)
    var strongWinFactor = Math.max(0, 1 - this.ratingParams.strongWinMultiplier * Math.abs(currentRatingB - currentRatingA))
    // console.log(weakWinFactor, strongWinFactor)
    if (currentRatingA < currentRatingB) {
      if (setWin > 0) {
        newRatingA += this.ratingParams.winBonus * weakWinFactor * ratingParams.weakWin;
        newRatingB -= weakWinFactor * ratingParams.weakWin;
      } else if (setWin < 0) {
        newRatingA -= strongWinFactor * ratingParams.strongWin;
        newRatingB += this.ratingParams.winBonus * strongWinFactor * ratingParams.strongWin;
      }
      if (gameWin > 0) {
        newRatingA += this.ratingParams.winBonus * weakWinFactor * gameWin * ratingParams.weakGameWin;
        newRatingB -= weakWinFactor * gameWin * ratingParams.weakGameWin;
      } else if (gameWin < 0) {
        newRatingA -= strongWinFactor * gameWin * ratingParams.strongGameWin;
        newRatingB += this.ratingParams.winBonus * strongWinFactor * gameWin * ratingParams.strongGameWin;
      }
    } else {
      if (setWin > 0) {
        newRatingA += this.ratingParams.winBonus * strongWinFactor * ratingParams.strongWin;
        newRatingB -= strongWinFactor * ratingParams.strongWin;
      } else if (setWin < 0) {
        newRatingA -= weakWinFactor * ratingParams.weakWin;
        newRatingB += this.ratingParams.winBonus * weakWinFactor * ratingParams.weakWin;
      }
      if (gameWin > 0) {
        newRatingA += this.ratingParams.winBonus * strongWinFactor * gameWin * ratingParams.strongGameWin;
        newRatingB -= strongWinFactor * gameWin * ratingParams.strongGameWin;
      } else if (gameWin < 0) {
        newRatingA -= weakWinFactor * gameWin * ratingParams.weakGameWin;
        newRatingB += this.ratingParams.winBonus * weakWinFactor * gameWin * ratingParams.weakGameWin;
      }
    }

    if (players[2] && players[3]) {
      this.users[players[0]].currentRating += (newRatingA - currentRatingA) / 2;
      this.users[players[1]].currentRating += (newRatingB - currentRatingB) / 2;
      this.users[players[2]].currentRating += (newRatingA - currentRatingA) / 2;
      this.users[players[3]].currentRating += (newRatingB - currentRatingB) / 2;
    } else {
      this.users[players[0]].currentRating = newRatingA;
      this.users[players[1]].currentRating = newRatingB;
    }
    // console.log(players, scores, currentRatingA, newRatingA, currentRatingB, newRatingB)

    this.verifyRating(players, matchDate);
    for (let p in players) {
      // if (players[p] == "n:42027") {
      //   console.log(scores, players,currentRatingA, newRatingA, currentRatingB, newRatingB, this.users[players[p]].ratings)
      // }
      this.users[players[p]].currentRatingDate = new Date(matchDate);
      if (!this.users[players[p]].ratings) {
        this.users[players[p]].ratings = [];
      }
      this.users[players[p]].ratings.push({r:this.users[players[p]].currentRating, d:matchDate})
    }
  },
  getYearEndRating(uid, year) {
    if (!this.users[uid].teams) {
      if (this.users[uid].r) {
        return parseInt(this.users[uid].r);
      }
      return 3.25;
    }
    var teams = Object.keys(this.users[uid].teams);

    for (var t = teams.length - 1; t >=0; t--) {
      if ((new Date(this.users[uid].teams[teams[t]].d)).getFullYear() <= year) {
        if (t < teams.length - 1) {
          return parseFloat(this.users[uid].teams[teams[t + 1]].r)
        } else {
          return parseFloat(this.users[uid].teams[teams[t]].r);
        }
      }
    }
    if (teams.length > 0) {
      return parseFloat(this.users[uid].teams[teams[0]].r)
    }
    return 0;
  },

  verifyRating(players, matchDate) {
    for (let p in players) {
      if (matchDate.getFullYear() != this.users[players[p]].currentRatingDate.getFullYear()) {
        let r = this.getYearEndRating(players[p], this.users[players[p]].currentRatingDate.getFullYear());
        let l = this.getYearEndRating(players[p], this.users[players[p]].currentRatingDate.getFullYear() - 1);
        if (r < this.users[players[p]].currentRating || r - 0.5 > this.users[players[p]].currentRating) {
          if (r > l) {
            this.missedUp++;
          } else if (r < l) {
            this.missedDown++;
          } else {
            if (this.users[players[p]].currentRating > r) {
              this.falseUp++;
            } else {
              this.falseDown++;
            }
          }
          var a = (r-0.49)/this.users[players[p]].currentRating;
          if (r < this.users[players[p]].currentRating) {
            var a = (r+0.01)/this.users[players[p]].currentRating;
          }
          if (this.users[players[p]].ratings) {
            for (let i=1; i < this.users[players[p]].ratings.length; i++) {
              this.users[players[p]].ratings[i].r = this.users[players[p]].ratings[i].r * a;
            }
          }
          // if (players[p] == "n:42027") {
          //   console.log(r, l, this.users[players[p]].currentRating, matchDate)
          // }
          // console.log(r, this.users[players[p]].currentRating, a, matchDate, this.users[players[p]].currentRating*a, this.users[players[p]])
          this.users[players[p]].currentRating *= a;//2 * this.users[players[p]].currentRating / a - this.users[players[p]].currentRating / a / a;
        } else {
          if (r > l) {
            this.caughtUp++;
          } else if (r < l) {
            this.caughtDown++;
          } else {
            this.correctStay++;
          }
        }
      }
    }
  },
  printRatings() {
    console.log("swm",this.ratingParams.strongWinMultiplier,"wwm", this.ratingParams.weakWinMultiplier, (this.falseUp + this.falseDown)/this.correctStay, this.falseUp, this.falseDown, this.correctStay,
      "Up", this.missedUp/(this.missedUp + this.caughtUp), this.missedUp, this.caughtUp, "Down", this.missedDown/(this.missedDown + this.caughtDown), this.missedDown, this.caughtDown)
  },
  calculate(start, end = 1) {
    if (!start) {
      start = this.lines.length - 2;
    }
    var lines = this.lines;
    for (let i in this.users) {
      this.users[i].currentRating = null;
    }
    this.missedDown = 0;
    this.missedUp = 0;
    this.caughtUp = 0;
    this.caughtDown = 0;
    this.falseUp = 0;
    this.falseDown = 0;
    this.correctStay = 0;
    this.wrongCases = [];
    for (let i = start; i > end; i--) {
      if (i % 10000 == 0) {
        // console.log(i)
      }
      if (!lines[i]) break;
      var fields = lines[i].split(";");
      if (fields.length < 6) continue;
      // console.log(fields)
      var matchDate = fields[6];
      var scores = fields[4];
      var players = fields[5].split(",");
      if (players.length < 2 || players[0] == "0" || players[1] == "0") continue;
      for (let p in players) {
        players[p] = "n:"+players[p];
      }
      this.adjustRating(players, new Date(matchDate), scores, this.ratingParams);
    }
    this.printRatings();
  },
  users: {},
  wrongCases: [],
  correctCases: [],
  ratingParams: {
    weakWin: 0.06,
    strongWin: 0.01,
    weakGameWin: 0.01,
    strongGameWin: 0.002,
    weakWinMultiplier : 2,
    strongWinMultiplier: 2.5,
    winBonus: 1.1,
  },
  falseUp: 0,
  falseDown: 0,
  caughtUp: 0,
  missedUp: 0,
  caughtDown: 0,
  missedDown: 0,
  correctStay: 0,
  print(uid) {
    console.log(this.users[uid] || this.users["n:"+uid]);
  }
};
var RatingCalculator = React.createClass({

  onUpload(files) {
    var reader = new FileReader();
    var self = this;
    reader.onload = function(event) {
      var lines = this.result.split('\n');
      console.log(lines[0])
      switch (lines[0]) {
        case "score":
          Rating.lines = lines;
          Rating.calculate();
          break;
        default:
          var json = lines.join("");
          Rating.users = eval("(" + json + ')');
          Rating.users = Rating.users.web.data.users;
          console.log("bingo")
          Rating.cities = {};
          for (let i in Rating.users) {
            if (Rating.users[i].residence) {
              let r = Rating.users[i].residence.toLowerCase()
              if (!Rating.cities[r]) {
                Rating.cities[r] = 1
              } else {
                Rating.cities[r]++;
              }
            }
          }
          for (let c in Rating.cities) {
            try {
              Fbase.set("web/data/cities/"+c, Rating.cities[c]);
            } catch (error) {
            }
          }
          break;
      }
    };
    reader.readAsText(files[0]);
  },
  render() {
    return (
      <Dropzone onDrop={this.onUpload}>
        <div>Select score file.</div>
      </Dropzone>
    )
  }
});

module.exports = RatingCalculator;
