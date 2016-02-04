import React from 'react';
import Select from 'react-select';

var PlayerSelect = React.createClass({
	displayName: 'PlayerSelect',
	propTypes: {
		label: React.PropTypes.string,
		value: React.PropTypes.array,
    onChange: React.PropTypes.func,
	},
	getInitialState () {
		return {
			disabled: false,
			value: {player1: [], player2: []}
		};
	},
	handleSelectChange1 (value, values) {
		this.setState({ player1: value });
		this.props.onChange("player1", value);
	},
	handleSelectChange2 (value, values) {
		this.setState({ player2: value });
		this.props.onChange("player2", value);
	},
	toggleDisabled (e) {
		this.setState({ 'disabled': e.target.checked });
	},
	render () {
		var ops = [
			{ label: 'Chocolate', value: 'chocolate' },
			{ label: 'Vanilla', value: 'vanilla' },
			{ label: 'Strawberry', value: 'strawberry' },
			{ label: 'Caramel', value: 'caramel' },
			{ label: 'Cookies and Cream', value: 'cookiescream' },
			{ label: 'Peppermint', value: 'peppermint' }
		];
		return (
			<table className="wholerow">
				<tbody><tr>
					<td className="playersection">
						<span className="section">
							<h3 className="section-heading">{this.props.label}</h3>
							<Select multi value={this.state.player1} placeholder="Select player(s)" options={ops} onChange={this.handleSelectChange1} />
						</span>
					</td>
					<td className="divider"> VS </td>
					<td className="playersection">
						<span className="section">
							<h3 className="section-heading">{this.props.label}</h3>
							<Select multi value={this.state.player2} placeholder="Select player(s)" options={ops} onChange={this.handleSelectChange2} />
						</span>
					</td>
				</tr></tbody>
			</table>
		);
	}
});

module.exports = PlayerSelect;
