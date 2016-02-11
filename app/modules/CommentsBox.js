import React from 'react';
import Comment from './Comment';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactDOM from 'react-dom'

var CommentsBox = React.createClass({
  propTypes: {
    comments: React.PropTypes.object,
  },

  getInitialState () {
    return {};
  },
  getComments() {
    var comments = [];
    if (this.props.comments) {
      for (let key in this.props.comments) {
        comments.push(<Comment key={key} comment={this.props.comments[key]} />);
      };
    }
    return (
      <div>
        {comments}
      </div>
    );
  },
  componentDidMount: function() {
    if (this.refs.scrollbars) {
      this.refs.scrollbars.scrollToBottom();
    }
  },
  componentWillUpdate: function() {
    if (this.refs.scrollbars) {
      var node = ReactDOM.findDOMNode(this.refs.scrollbars);
      this.shouldScrollBottom = this.refs.scrollbars.getScrollHeight() - this.refs.scrollbars.getScrollTop() < node.offsetHeight + 10;
    }
  },
  componentDidUpdate: function() {
    if (this.refs.scrollbars && this.shouldScrollBottom) {
      this.refs.scrollbars.scrollToBottom();
    }
  },
  render() {
    if (this.props.comments) {
      var cls = "commentsBoxBody";
      var comments = this.getComments();
      return <Scrollbars ref="scrollbars" style={{ height: 350 }} className={cls}> {comments} </Scrollbars>;
    }
    return null;
  }
});

module.exports = CommentsBox;
