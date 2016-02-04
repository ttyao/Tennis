import React from 'react';
import Firebase from 'firebase';

export default class FirebaseModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {authData: null};
  }

  authDataCallback(authData) {
    if (!authData) {
      var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");
      ref.authWithOAuthRedirect("facebook", function (error) {
        console.log("Login Failed!", error);
      });
    }
    else {
      console.log("Authenticated successfully with payload:", authData);
    }
  }

  getLoginName() {
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");

    // Create a callback which logs the current auth state

    ref.onAuth(this.authDataCallback);

    var authData = ref.getAuth();
    if (authData) {
      var userRef = ref.child("web/data/users/" + authData["uid"]);
      var user = {};
      user[authData["uid"]] = authData["facebook"];
      user[authData["uid"]]["loggedInAt"] = Date.now();
      userRef.set(user[authData["uid"]]);
    }
    var name = authData ? authData.facebook.displayName : "anonymous";

    var dataRef = ref.child("/web/data");
    dataRef.child("users").orderByChild("displayName").on("value", function(snapshot) {
      snapshot.forEach(function(data) {
        console.log(data.val());
      });
    });
    return name;
  }

  render() {
    return (
      <div>
        Welcome back, {this.getLoginName()}
      </div>
    );
  }
}

FirebaseModule.defaultProps = { frictionConfig: {} };
