import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);

var Login = React.createClass({
  getInitialState: function() {
    var ref = new Firebase("https://blistering-torch-8342.firebaseio.com");
    var authData = ref.getAuth();
    if (authData) {
      var userRef = ref.child("web/data/users/"+authData["uid"]);
      userRef.child("loggedInAt").set(Date.now());
      if (authData.facebook) {
        userRef.child("displayName").set(authData.facebook.displayName);
      }
    }
    return { unauthed: !authData, firebaseUrl: "https://blistering-torch-8342.firebaseio.com" };
  },

  handleRegisterClicked() {
    if (!this.state.email) {
      alert("email is required for register.");
    } else if (!this.state.password) {
      alert("Password is required for register.");
    } else if (!this.state.displayName) {
      alert("Username is required for register.");
    } else {
      var ref = new Firebase(this.state.firebaseUrl);
      var displayName = this.state.displayName;
      var email = this.state.email;
      var password = this.state.password;
      ref.createUser({
        email: this.state.email,
        password: this.state.password,
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
                var userRef = ref.child("web/data/users/"+userData["uid"]);
                userRef.set({
                  displayName: displayName,
                  createdAt: Date.now()
                }, function(error){
                  if (!error) {
                    location.reload();
                  }
                });
              }
          });
        }
      });
    }
  },

  handleLoginClicked: function(e) {
    var ref = new Firebase(this.state.firebaseUrl);
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
    var ref = new Firebase(this.state.firebaseUrl);
    ref.authWithOAuthRedirect("facebook", function (error) {
      alert("Login Failed!");
    });
  },
  handleModalCloseRequest() {
    this.setState({unauthed:false});
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
              <button type="button" className="btn btn-primary loginButton fbLogin" onClick={this.handleFacebookLoginClicked}>.</button>
            </div>
            <div className="centerContainer">
              <button type="button" className="btn btn-primary nologinButton" onClick={this.handleModalCloseRequest}>先不注册, 随便看看</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = Login;
