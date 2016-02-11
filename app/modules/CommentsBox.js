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
      console.log(this.refs.scrollbars);
      this.refs.scrollbars.scrollToBottom();
    }
  },
  componentWillUpdate: function() {
    if (this.refs.scrollbars) {
      this.shouldScrollBottom = this.refs.scrollbars.getScrollHeight() - this.refs.scrollbars.getScrollTop() < 360;
      // console.log("willupdate",     this.refs.scrollbars.getScrollTop(), this.refs.scrollbars.getScrollHeight());
    }
  },
  componentDidUpdate: function() {
    // console.log("didupdate",     this.refs.scrollbars.getScrollTop(), this.refs.scrollbars.getScrollHeight(), this.shouldScrollBottom);
    if (this.refs.scrollbars && this.shouldScrollBottom) {
      this.refs.scrollbars.scrollToBottom();
    }
  },
  render() {
    if (this.props.comments) {
      var cls = "commentsBoxBody";
      var comments = this.getComments();
      return <Scrollbars ref="scrollbars" style={{ height: 350 }} className={cls}> {comments} </Scrollbars>;
      // return <div onScroll={this.onScroll} className={cls} >{comments}</div>;
//       return (
//         <div ref="aaaa">
//         <Motion defaultStyle={{x: 0}} style={{x: spring(10)}}>
//           {value => <div>{value.x}</div>}
//         </Motion>
//         <button
//           ref="buttonss"
//           onMouseDown={this.handleMouseDown} >
//           Toggle
//         </button>
//         <Motion style={{x: spring(this.state.open ? 400 : 0)}}>
//           {({x}) =>
//             <div className={cls} ref={"commentBoxBody"} style={{
//                 WebkitTransform: `translate3d(0, 0, $(x/10)}px)`,
//                 transform: `translate3d(0, 0, ${x/10}px)`,
//               }}>
//               {comments}
//             </div>
//           }
//         </Motion>
// </div>
//       );
    }
    return null;
  }
});

module.exports = CommentsBox;
