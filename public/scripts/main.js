// main.js
var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (!authData) {
    console.log(authData);
    ref.authWithOAuthRedirect("facebook", function (error) {
      console.log("Login Failed!", error);
    });
  }
  else {
    console.log("Authenticated successfully with payload:", authData);
  }
}

ref.onAuth(authDataCallback);
//var newref = new Firebase("https://blistering-torch-8342.firebaseio.com");

var authData = ref.getAuth();
if (authData) {
  var userRef = ref.child("web/data/users/" + authData["uid"]);
  var user = {};
  user[authData["uid"]] = authData["facebook"];
  user[authData["uid"]]["loggedInAt"] = window.now();
  userRef.set(user[authData["uid"]]);
}
var name = authData ? authData.facebook.displayName : "anonymous";

var dataRef = ref.child("/web/data");
dataRef.child("users").orderByChild("displayName").on("value", function(snapshot) {
  snapshot.forEach(function(data) {
    console.log(data.val());
  });
});

var HelloMessage = React.createClass({
  render: function() {
    return <h2>Welcome back, {this.props.name}</h2>;
  }
});

var MatchRecorder = React.createClass({
  getInitialState: function() {
    return {players: [], scores: []};
  },
  handlePlayerSubmit: function() {

  },
  handleScoreSubmit: function() {

  },
  handleMatchSubmit: function() {

  },

  render: function() {
    return (
      <div>
        <div>Players:</div>
        <form onSubmit={this.handlePlayerSubmit}>
          <input ></input>
          <button>Add Player</button>
        </form>
        <div>Score:</div>
        <form onSubmit={this.handleScoreSubmit}>
          <input></input>
          <button>Add Set</button>
        </form>
        <div/>
        <form onSubmit={this.handleMatchSubmit}>
          <button>Submit</button>
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <div>
    <HelloMessage name={name} />
    <MatchRecorder />
  </div>,
  document.getElementById('content')
);
