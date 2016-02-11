import React from 'react';

require('./Progress.css');

export default class Progress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
      if (this.props.percentage) {
        const radius = this.props.radius - this.props.strokeWidth / 2;
        const width = this.props.radius * 2;
        const height = this.props.radius * 2;
        const viewBox = `0 0 ${width} ${height}`;
        const dashArray = radius * Math.PI * 2;
        const dashOffset = dashArray - dashArray * this.props.percentage / 100;

        return (
            <svg
                className="CircularProgress"
                width={this.props.radius * 2}
                height={this.props.radius * 2}
                viewBox={viewBox}>
                <circle
                    className="CircularProgress-Bg"
                    cx={this.props.radius}
                    cy={this.props.radius}
                    r={radius}
                    strokeWidth={`${this.props.strokeWidth}px`} />
                <circle
                    className="CircularProgress-Fg"
                    cx={this.props.radius}
                    cy={this.props.radius}
                    r={radius}
                    strokeWidth={`${this.props.strokeWidth}px`}
                    style={{
                        strokeDasharray: dashArray,
                        strokeDashoffset: dashOffset
                    }} />
                {false &&
                  <text
                    className="CircularProgress-Text"
                    x={this.props.radius}
                    y={this.props.radius}
                    dy=".4em"
                    textAnchor="middle">
                    {`${this.props.percentage}%`}
                </text>}
            </svg>
        );
      } else {
        return null;
      }
    }
}

Progress.defaultProps = {
    radius: 50,
    percentage: 0,
    strokeWidth: 1
};
