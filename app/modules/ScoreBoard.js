import React from 'react';

var ScoreBoard = React.createClass({
  propTypes: {
    scores: React.PropTypes.array,
    onChange: React.PropTypes.func,
    editable: React.PropTypes.bool,
    status: React.PropTypes.string,
  },

  getDefaultProps () {
    return ({
      editable: false,
      status: "completed"
    });
  },

  getInitialState () {
    return {};
  },
  getScoreCell(index, score) {
    var callback = null;
    switch (index) {
      case 1: callback = this.onChange1; break;
      case 2: callback = this.onChange2; break;
      case 3: callback = this.onChange3; break;
      case 4: callback = this.onChange4; break;
      case 5: callback = this.onChange5; break;
      default: callback = this.onChange;
    }
    return (
      <div className="scoreBoardDiv">
        <select
          value={score}
          onChange={callback}>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select>
      </div>
    );
  },

  // ugly ... need to rewrite when figured out how to pass the select id to onchange function.
  onChange(event) {
    this.props.onChange(event, 0)
  },
  onChange1(event) {
    this.props.onChange(event, 1)
  },
  onChange2(event) {
    this.props.onChange(event, 2)
  },
  onChange3(event) {
    this.props.onChange(event, 3)
  },
  onChange4(event) {
    this.props.onChange(event, 4)
  },
  onChange5(event) {
    this.props.onChange(event, 5)
  },
  getScores() {
    var index = 0;
    var scores = this.props.scores.map(function(score) {
      index += 2;
      if (this.props.editable) {
        return (
          <td key={"score"+index}>
            {this.getScoreCell(index - 2, score[0])}
            {this.getScoreCell(index - 1, score[1])}
          </td>
        );
      } else {
        if (this.props.status != "completed" || score[0] + score[1] > 0) {
          return (
            <td key={"score"+index}>
              <div>{score[0]}</div>
              <div>{score[1]}</div>
            </td>
          );
        } else {
          return null;
        }
      }
    }, this);
    return (
      <td>
        <table className="scoreBoardContainer">
          <tbody><tr>
          {scores}
          </tr></tbody>
        </table>
      </td>
    );
  },
  getScoreBoard() {
    if (this.props.scores) {
      var cells = [];
      if (!this.props.status || this.props.status == "completed") {
        var setWin = 0;
        for (let i in this.props.scores) {
          if (this.props.scores[i][0] > this.props.scores[i][1]) {
            setWin++;
          } else if (this.props.scores[i][0] < this.props.scores[i][1]) {
            setWin--;
          }
        }
        if (setWin > 0) {
          cells =
            <tr>
              <td><img className="checkmark" src="images/checkmark-green.png"/></td>
              {this.getScores()}
              <td><img className="checkmark" src="images/transparent.ico"/></td>
            </tr>;
        } else if (setWin < 0) {
          cells =
            <tr>
              <td><img className="checkmark" src="images/transparent.ico"/></td>
              {this.getScores()}
              <td><img className="checkmark" src="images/checkmark-green.png"/></td>
            </tr>;
        } else {
          cells = <tr>{this.getScores()}</tr>;
        }
      } else if (this.props.status == "active") {
        cells = <tr>{this.getScores()}</tr>;
      }
      return (
        <table className="wholerow"><tbody>
          {cells}
        </tbody></table>
      );
    }
  },
  render() {
    return (
      <div className="centerContainer">
        {this.getScoreBoard()}
      </div>
    );
  }
});

module.exports = ScoreBoard;
