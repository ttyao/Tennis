import React from 'react';
import ReactDOM from 'react-dom';
import Menu from './modules/Menu';
import Modal from 'react-modal';
import Login from './modules/Login';
import moment from 'moment';
import { Router, Route, browserHistory, hashHistory } from 'react-router'

require("./modules/ImageResizer.js");
require("./modules/Fbase.js");
require("./modules/aws.js");
require("./css/main.css");
'use strict';

window.now = function(date) {
  if (date === '' || date === false || date === null) {
    date = null;
  } else {
    if (parseInt(date) > 315532800) { // 1980/1/1
        date = parseInt(date);
        if (date < 315532800000) { // convert to millisec
            date *= 1000
        }
    }
    if (!typeof date === "number") {
      if (date.toJSON) {
          date = date.toJSON();
      } else {
          date = date.toString();
      }
      var t = date.split(/[:\-TZ\. ]/);
      for (var i in t) {
          if (t[i] !== '' && isNaN(parseInt(t[i], 10))) return false;
      }
      if (t.length < 6) return false;

      var d = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5], t[6]);

      date = d.getTime();
    }
  }
  return moment(date).utcOffset(-8).format("YYYY-MM-DD-HH-mm-ss-SSS");
};

window.Fbase.init(main);

function main() {
  ReactDOM.render(
    <Router history={browserHistory}>
      <div>
      <div className="page-body">
        <div className="container">
          <Route path="/" component={Menu} />
          <Route path="/:tab" component={Menu} />
          <Route path="/:tab/:ladder" component={Menu} />
          <Route path="/:tab/:ladder/:player0" component={Menu} />
          <Route path="/:tab/:ladder/:player0/:player1" component={Menu} />
        </div>
      </div>
      </div>
    </Router>,
    document.getElementById('app')
  );
}

var appElement = document.getElementById('modal');

ReactDOM.render(<Login/>, appElement);
