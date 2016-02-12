import React from 'react';
import Timestamp from './Timestamp';
import Linkify from 'react-linkify';

var Comment = React.createClass({
  propTypes: {
    comment: React.PropTypes.object,
  },

  getInitialState () {
    return {};
  },
  getComment() {
    var comment = this.props.comment;
    var type = comment.type || "comment";
    switch (comment.type) {
      case "image":
      case "pic":
        return (<a href={comment.URL || comment.thumbURL}><img className="pictureComment" src={comment.thumbURL || "images/tennis_ball.gif"} /></a>);
      case "video":
        return (<a href={comment.URL}>📹{comment.title || "Play video"}📹</a>);
      case "system":
        return (<div className="commenter">{comment.comment}</div>);
      default:
        return comment.comment;
    }
    return null;
  },
  render() {
    if (this.props.comment && this.props.comment.createdTime && this.props.comment.creator) {
      return (
        <div className="commentBody">
          <div className="commenter">
            {window.Fbase.getDisplayName(this.props.comment.creator)}: (
            <Timestamp time={this.props.comment.createdTime} />)
          </div>
          <Linkify>
            {this.getComment()}
          </Linkify>
        </div>
      );
    }
    return null;
  }
});

module.exports = Comment;
