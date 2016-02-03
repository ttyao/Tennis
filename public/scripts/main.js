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
  var usersRef = ref.child("web/data/users");
  var user = {};
  user[authData["uid"]] = authData["facebook"];
  user[authData["uid"]]["loggedInAt"] = Date.now();
  usersRef.set(user);
}
var name = authData ? authData.facebook.displayName : "anonymous";

ReactDOM.render(
  <h3>Welcome back, {name}</h3>,
  document.getElementById('content')
);
