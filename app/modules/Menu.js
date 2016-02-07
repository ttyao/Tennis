import React from 'react';
import Firebase from 'firebase';
import Tabs from './Tabs';
import MatchRecorder from './MatchRecorder';
import MatchList from './MatchList';
import Modal from 'react-modal';
import Head2Head from './Head2Head';

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
  }

  authDataCallback(authData) {
    if (!authData) {
      var ref = window.Fbase.getRef();
      ref.authWithOAuthRedirect("facebook", function (error) {
        console.log("Login Failed!", error);
      });
    }
    else {
      console.log("Authenticated successfully with payload:", authData);
    }
  }

  logout() {
    var ref = window.Fbase.getRef();
    ref.unauth();
    location.reload();
  }

  render() {

    return (
      <div>
        <Tabs tabActive={1} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
          <Tabs.Panel title='最新战报'>
            <MatchList value={this.state.scores} />
          </Tabs.Panel>
          <Tabs.Panel title='输入战绩'>
            <MatchRecorder />
          </Tabs.Panel>
          <Tabs.Panel title="H2H">
            <Head2Head player1={window.Fbase.authUid()} player2="" />
            <button className="submitButton centerContainer" onClick={this.logout} >logout</button>
          </Tabs.Panel>
        </Tabs>
      </div>
    );
  }
}

Menu.defaultProps = { frictionConfig: {} };
