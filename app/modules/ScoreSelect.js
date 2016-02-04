import React from 'react';
import Select from 'react-select';

export default class ScoreSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {score1: 0, score2: 0};
    this.handleScore1Change = this.handleScore1Change.bind(this);
    this.handleScore2Change = this.handleScore2Change.bind(this);
  }

  getOtherScore(value) {
    switch (value) {
      case 6: return -1;
      case 7: return 6;
      case 5: return 7;
      case 0: return -1;
      default: return 6;
    }
  }

  handleScore1Change(value) {
    var otherScore = this.getOtherScore(value);
    if (otherScore > 0) {
      this.setState({score1: value, score2: otherScore}, this.callback);
    } else {
      this.setState({score1: value}, this.callback);
    }
  }

  handleScore2Change(value) {
    var otherScore = this.getOtherScore(value);
    if (otherScore > 0) {
      this.setState({score1: otherScore, score2: value}, this.callback);
    } else {
      this.setState({score2: value}, this.callback);
    }
  }

  callback() {
    this.props.onChange(this.props.id, this.state);
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
          <td className="scoresection">
            <Select options={options} value={this.state.score1} onChange={this.handleScore1Change}/>
          </td>
          <td className="divider">:</td>
          <td className="scoresection">
            <Select options={options} value={this.state.score2} onChange={this.handleScore2Change} />
          </td>
          <td className="rowlabel"></td>
        </tr></tbody>
      </table>
    );
  }
}

ScoreSelect.defaultProps = { frictionConfig: {} };
