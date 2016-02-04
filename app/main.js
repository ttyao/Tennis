import React from 'react';
import ReactDOM from 'react-dom';
import MatchRecorder from './modules/MatchRecorder';
import FirebaseModule from './modules/FirebaseModule';
main();

function main() {
  ReactDOM.render(
    <div>
      <FirebaseModule />
      <MatchRecorder />
    </div>,
    document.getElementById('app')
  );
}
