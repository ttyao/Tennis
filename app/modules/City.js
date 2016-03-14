import React from 'react';

var City = React.createClass({
  getInitialState () {
    return {};
  },
  componentDidMount () {
    if (this.props.city) {
      var ref = window.Fbase.getRef("web/data/cities/"+this.props.city.toLowerCase());
      var self = this;
      ref.once('value', function(s) {
        if (s.val()) {
          self.setState({count: s.val()})
        }
      })
    }
  },
  render() {
    if (this.state.count) {
      return (
        <span> ({this.state.count})</span>
      );
    }
    return null;
  }
});

module.exports = City;
