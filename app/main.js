import React from 'react';
import ReactDOM from 'react-dom';
import Hello from './component.js';
import MatchRecorder from './modules/MatchRecorder';
// require('style!css!sass!react-select/less/default.less');

main();

function main() {
  ReactDOM.render(
    <div>
      <Hello />
      <MatchRecorder />
    </div>,
    document.getElementById('app')
  );
}
