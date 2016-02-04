var Select = require('react-select');
var React = require('react');
var ReactDOM = require('react-dom');
require('style!css!sass!react-select/scss/default.scss');

// import MultiSelectField from 'MultiSelectField';

var options = [
    { value: 'one', label: 'One' },
    { value: 'two', label: 'Two' }
];

function logChange(val) {
    console.log("Selected: " + val);
}

const FLAVOURS = [
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Strawberry', value: 'strawberry' },
  { label: 'Caramel', value: 'caramel' },
  { label: 'Cookies and Cream', value: 'cookiescream' },
  { label: 'Peppermint', value: 'peppermint' },
];

const WHY_WOULD_YOU = [
  { label: 'Chocolate (are you crazy?)', value: 'chocolate', disabled: true },
].concat(FLAVOURS.slice(1));


function logChange() {
  console.log.apply(console, [].concat(['Select value changed:'], Array.prototype.slice.apply(arguments)));
}

var MultiSelectField = React.createClass({
  displayName: 'MultiSelectField',
  propTypes: {
    label: React.PropTypes.string,
  },
  getInitialState () {
    return {
      disabled: false,
      value: []
    };
  },
  handleSelectChange (value, values) {
    logChange('New value:', value, 'Values:', values);
    this.setState({ value: value });
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
      <div className="section">
        <h3 className="section-heading">{this.props.label}</h3>
        <Select multi disabled={this.state.disabled} value={this.state.value} placeholder="Select your favourite(s)" options={ops} onChange={this.handleSelectChange} />
        <div className="checkbox-list">
          <label className="checkbox">
            <input type="checkbox" className="checkbox-control" checked={this.state.disabled} onChange={this.toggleDisabled} />
            <span className="checkbox-label">Disabled</span>
          </label>
        </div>
      </div>
    );
  }
});


ReactDOM.render(
  <div>
    <MultiSelectField label="Multiselect" />
    <Select options={FLAVOURS} />
  </div>,
  document.getElementById('example')
);

console.log("init");
