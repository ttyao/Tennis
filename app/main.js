import React from 'react';
import ReactDOM from 'react-dom';
import Menu from './modules/Menu';
import Modal from 'react-modal';
import Login from './modules/Login';
import { Router, Route, browserHistory, hashHistory } from 'react-router'

require("./modules/ImageResizer.js");
require("./modules/Fbase.js");
require("./modules/aws.js");
require("./css/main.css");
require("./modules/Utils.js");
'use strict';

window.Fbase.init(main);

function main() {
  ReactDOM.render(
    <Router history={browserHistory}>
      <div className="page-body">
        <div className="container">
          <Route path="/" component={Menu} />
          <Route path="/:tab" component={Menu} />
          <Route path="/:tab/:ladderId" component={Menu} />
          <Route path="/:tab/:ladderId/:playerId" component={Menu} />
        </div>
      </div>
    </Router>,
    document.getElementById('app')
  );
}

var appElement = document.getElementById('modal');

ReactDOM.render(<Login/>, appElement);
