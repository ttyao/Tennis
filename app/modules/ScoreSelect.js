import React from 'react';
import Select from 'react-select';

export default class ScoreSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {scores: [0, 0]};
    this.handleScore1Change = this.handleScore1Change.bind(this);
    this.handleScore2Change = this.handleScore2Change.bind(this);
  }

  getOtherScore(value, otherScore) {
    if (otherScore) {
      return otherScore;
    }
    switch (value) {
      case 6: return otherScore;
      case 7: return 6;
      case 5: return 7;
      case 0: return otherScore;
      default: return 6;
    }
  }

  handleScore1Change(event) {
    var value = parseInt(event.target.value);
    var otherScore = this.getOtherScore(value, parseInt(this.state.scores[1]));
    this.setState({scores: [value, otherScore]}, this.callback);
  }

  handleScore2Change(event) {
    var value = parseInt(event.target.value);
    var otherScore = this.getOtherScore(value, parseInt(this.state.scores[0]));
    this.setState({scores: [otherScore, value]}, this.callback);
  }

  callback() {
    this.props.onChange(this.props.id, this.state.scores);
  }

  render() {
    var options = [
      { value: 0, label: '0' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
      { value: 6, label: '6' },
      { value: 7, label: '7' },
    ];
    return (
      <table className="wholerow">
        <tbody><tr>
          <td className="rowlabel">
            {this.props.label}
          </td>
          <td>
            <select className="scoreselect" value={this.state.scores[0]} onChange={this.handleScore1Change}>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </td>
          <td className="divider">:</td>
          <td>
            <select className="scoreselect" value={this.state.scores[1]} onChange={this.handleScore2Change}>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </td>
          <td className="rowlabel"></td>
        </tr></tbody>
      </table>
    );
  }
}

ScoreSelect.defaultProps = { frictionConfig: {} };
