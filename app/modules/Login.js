import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);

var Login = React.createClass({
  getInitialState: function() {
    var ref = window.Fbase.getRef();
    var authData = ref.getAuth();
    if (authData && authData.facebook) {
      // var userRef = ref.child("/web/data/users/"+authData["uid"]);
      // userRef.child("loggedInAt").set(window.now());
      // if (authData.facebook) {
      //   userRef.child("displayName").set(authData.facebook.displayName);
      // }
    } else {
      window.Fbase.setSessionId();
    }
    return { unauthed: !authData };
  },

  handleRegisterClicked() {
    if (!this.state.email) {
      alert("email is required for register.");
    } else if (!this.state.password) {
      alert("Password is required for register.");
    } else if (!this.state.displayName) {
      alert("Username is required for register.");
    } else {
      var ref = window.Fbase.getRef();
      var displayName = this.state.displayName;
      var email = this.state.email;
      var password = this.state.password;
      window.Fbase.onceDisplayNameExists(displayName, function(uid) {
        if (uid && uid.slice(0, 6) != 'guest:') {
          alert("username is already taken.");
          return;
        } else {
          ref.createUser({
            email: email,
            password: password,
          }, function(error, userData) {
            if (error) {
              switch (error.code) {
                case "EMAIL_TAKEN":
                  alert("The new user account cannot be created because the email is already in use.");
                  location.reload();
                  break;
                case "INVALID_EMAIL":
                  alert("The specified email is not a valid email.");
                  break;
                default:
                  console.log(error);
                  alert("Error creating user.");
              }
            } else {
              ref.authWithPassword({
                "email": email,
                "password": password
                }, function (error, authData) {
                  if (error) {
                    alert("Login Failed!");
                  } else {
                    var userRef = ref.child("/web/data/users/"+userData["uid"]);
                    userRef.set({
                      displayName: displayName,
                      createdAt: window.now()
                    }, function(error){
                      if (!error) {
                        location.reload();
                      }
                    });
                    window.Fbase.log("trying to create user: "+displayName, "write", "createUser");
                  }
              });
            }
          });
        }
      });
    }
  },

  handleLoginClicked: function(e) {
    var ref = window.Fbase.getRef();
    ref.authWithPassword({
      "email": this.state.email,
      "password": this.state.password
      }, function (error, authData) {
        if (error) {
          alert("Login Failed!");
        } else {
          location.reload();
        }
    });
  },

  onEmailChange(e) {
    this.setState({email: e.target.value});
  },
  onPasswordChange(e) {
    this.setState({password: e.target.value});
  },
  onDisplayNameChange(e) {
    this.setState({displayName: e.target.value});
  },
  handleFacebookLoginClicked() {
    var ref = window.Fbase.getRef();
    ref.authWithOAuthRedirect("facebook", function (error) {
      alert("Login Failed!");
    });
  },
  handleModalCloseRequest() {
    this.setState({unauthed:false});
  },
  fblogin() {
    // <button type="button" className="btn btn-primary loginButton fbLogin" onClick={this.handleFacebookLoginClicked}>.</button>
    return null;
  },
  render: function() {
    return (
      <div>
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          isOpen={this.state.unauthed}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title centerContainer">Login Required</h4>
            </div>
            <div className="modal-body centerContainer">
            <table>
              <tbody><tr>
                <td> Email: </td>
                <td>
                  <input key="email" onChange={this.onEmailChange} />
                </td>
                </tr><tr>
                <td> Password: </td>
                <td>
                  <input key="password" type="password" onChange={this.onPasswordChange} />
                </td>
                </tr><tr>
                <td> Username: </td>
                <td>
                  <input key="displayName" onChange={this.onDisplayNameChange} />
                </td>
              </tr></tbody>
            </table>
            </div>
            <div className="modal-footer centerContainer">
              <button type="button" className="btn btn-primary loginButton" onClick={this.handleRegisterClicked}>Register</button>
              <button type="button" className="btn btn-primary loginButton" onClick={this.handleLoginClicked}>Login</button>
              {this.fblogin()}
            </div>
            <div className="centerContainer">
              <button type="button" className="btn btn-primary nologinButton" onClick={this.handleModalCloseRequest}>Visit as guest</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = Login;
