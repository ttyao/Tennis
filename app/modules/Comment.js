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
        var cls = "pictureComment";
        var pictureHeight = 140;
        var pictureStyle = {
          display: "block",
          height: pictureHeight+"px",
        }
        var divStyle = {};
        if (comment.exif && comment.exif.Orientation && comment.exif.PixelXDimension) {
          var pictureWidth = pictureHeight * comment.exif.PixelXDimension / comment.exif.PixelYDimension;
          var offset = Math.floor((pictureWidth - pictureHeight) / 2);
          switch (comment.exif.Orientation) {
            case 5:
            case 6:
              cls += " picRotate90";
              pictureStyle["marginTop"] = offset + "px";
              pictureStyle["marginLeft"] = -offset + "px";
              divStyle.height = (pictureWidth - offset) + "px";
              break;
            case 3:
            case 4:
              pictureStyle["marginTop"] = pictureHeight + "px";
              pictureStyle["marginLeft"] = (pictureWidth) + "px";
              divStyle.height = "0";
              cls += " picRotate180";
              break;
            case 7:
            case 8:
              pictureStyle["marginTop"] = pictureWidth + "px";
              divStyle.height = 0;
              cls += " picRotate270";
              break;
          }
        }
        return (
          <div style={divStyle} >
            <a href={comment.URL || comment.thumbURL}>
              <img style={pictureStyle} className={cls} src={comment.thumbURL || "images/tennis_ball.gif"} />
            </a>
          </div>);
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
