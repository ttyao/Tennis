import React from 'react';
import ReactDOM from 'react-dom';
import Menu from './modules/Menu';
import Timestamp from 'react-timestamp';
import Modal from 'react-modal';
import Login from './modules/Login';

main();

function main() {
  ReactDOM.render(
    <div>
      <div className="page-body">
        <div className="container">
          <Menu />
        </div>
      </div>
    </div>,
    document.getElementById('app')
  );
}

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);


ReactDOM.render(<Login/>, appElement);
