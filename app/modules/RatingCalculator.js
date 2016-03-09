import React from 'react';
var Dropzone = require('react-dropzone');

var RatingCalculator = React.createClass({
  users: {},
  wrongCases: [],
  ratingParams: {
    weakWin: 0.05,
    strongWin: 0.01,
    weakGameWin: 0.01,
    strongGameWin: 0.002,
  },
  getCurrentRating(uid, date) {
    var self = this;
    self.users[uid].currentRating = self.users[uid].r;
    self.users[uid].currentRatingDate = date;
    var teams = Object.keys(self.users[uid].teams).reverse();
    for (var t in teams) {
      if (new Date(self.users[uid].teams[teams[t]].d) < date && self.users[uid].teams[teams[t]].r.length == 4) {
        self.users[uid].currentRating = parseFloat(self.users[uid].teams[teams[t]].r);
        self.users[uid].currentRatingDate = new Date(self.users[uid].teams[teams[t]].d);
        return;
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
    if (currentRatingA < currentRatingB) {
      if (setWin > 0) {
        newRatingA += ratingParams.weakWin;
        newRatingB -= ratingParams.weakWin;
      } else if (setWin < 0) {
        newRatingA -= ratingParams.strongWin;
        newRatingB += ratingParams.strongWin;
      }
      if (gameWin > 0) {
        newRatingA += gameWin * ratingParams.weakGameWin;
        newRatingB -= gameWin * ratingParams.weakGameWin;
      } else if (gameWin < 0) {
        newRatingA -= gameWin * ratingParams.strongGameWin;
        newRatingB += gameWin * ratingParams.strongGameWin;
      }
    } else {
      if (setWin > 0) {
        newRatingA += ratingParams.strongWin;
        newRatingB -= ratingParams.strongWin;
      } else if (setWin < 0) {
        newRatingA -= ratingParams.weakWin;
        newRatingB += ratingParams.weakWin;
      }
      if (gameWin > 0) {
        newRatingA += gameWin * ratingParams.strongGameWin;
        newRatingB -= gameWin * ratingParams.strongGameWin;
      } else if (gameWin < 0) {
        newRatingA -= gameWin * ratingParams.weakGameWin;
        newRatingB += gameWin * ratingParams.weakGameWin;
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
    console.log(currentRatingA, newRatingA, currentRatingB, newRatingB)
    this.verifyRating(players, matchDate);
    for (let p in players) {
      this.users[players[p]].currentRatingDate = new Date(matchDate);
    }
  },
  getYearEndRating(uid, date) {
    var teams = Object.keys(this.users[uid].teams);
    for (var t in teams) {
      if ((new Date(this.users[uid].teams[teams[t]].d)).getFullYear() < date.getFullYear() && this.users[uid].teams[teams[t]].r.length == 4) {
        return parseFloat(this.users[uid].teams[teams[t]].r);
      }
    }
  },
  verifyRating(players, matchDate) {
    for (let p in players) {
      console.log(this.users[players[p]])
      if (matchDate.getFullYear() != this.users[players[p]].currentRatingDate.getFullYear()) {
        let r = this.getYearEndRating(players[p], this.users[players[p]].currentRatingDate);
        if (r < this.users[players[p]].currentRating || r - 0.5 > this.users[players[p]].currentRating) {
          this.wrongCases.push({id: players[p], rating: this.users[players[p]].currentRating, ntrp:r, year:matchDate.getFullYear()})
        }
      }
    }
  },
  printRatings() {
    for (var id in this.wrongCases) {
      console.log(this.wrongCases[id]);
    }
  },
  calculate(lines, start, end) {
    for (let i = start; i > end; i--) {
      if (!lines[i]) break;
      var fields = lines[i].split(";");
      if (fields.length < 6) continue;
      // console.log(fields)
      var matchDate = fields[6];
      var scores = fields[4];
      var players = fields[5].split(",");
      if (players[0] == "0" || players[1] == "0") continue;
      for (let p in players) {
        players[p] = "n:"+players[p];
      }
      this.adjustRating(players, new Date(matchDate), scores, this.ratingParams);
    }
    this.printRatings();
  },
  onUpload(files) {
    var reader = new FileReader();
    var self = this;
    reader.onload = function(event) {
      var lines = this.result.split('\n');
      console.log(lines[0])
      switch (lines[0]) {
        case "score":
          self.calculate(lines, lines.length - 2, 1);
          break;
        default:
          var json = lines.join("");
          self.users = eval("(" + json + ')');
          self.users = self.users.web.data.users;
          console.log("bingo")
          //           self.getCurrentRating(["n:100000"], new Date("03/15/08"));
          // console.log(self.users["n:100000"])

          Fbase.users = self.users;
          break;
      }
    };
    reader.readAsText(files[0]);
  },
  render() {
    return (
      <Dropzone onDrop={this.onUpload} className="pictureUpload">
        <div>Select score file.</div>
      </Dropzone>
    )
  }
});

module.exports = RatingCalculator;
