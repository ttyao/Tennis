import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Tabs from './Tabs';
import { Link } from 'react-router'

var appElement = document.getElementById('modal');

Modal.setAppElement(appElement);

var Login = React.createClass({
  getInitialState: function() {
    var ref = window.Fbase.getRef();
    var authData = ref.getAuth();
    if (!authData) {
      window.Fbase.setSessionId();
    }
    return { isOpen: false };
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

      ref.createUser({
        email: email,
        password: password,
      }, function(error, userData) {
        console.log("create user", userData);
        if (error) {
          switch (error.code) {
            case "EMAIL_TAKEN":
              alert("The new user account cannot be created because the email is already in use.");
              return;
            case "INVALID_EMAIL":
              alert("The specified email is not a valid email.");
              return;
            default:
              console.log(error);
              Fbase.log(error,"error", "register");
              alert("Error happened when creating user.");
              return;
          }
        } else {
          ref.authWithPassword({
            "email": email,
            "password": password
            }, function (error, authData) {
              if (error) {
                alert("Login Failed!");
                Fbase.log({error:JSON.stringify(error), email: email}, "error", "login");
              } else {
                var userRef = ref.child("/web/data/users/"+userData["uid"]);
                userRef.set({
                  displayName: displayName,
                  displayName_: displayName.toLowerCase(),
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
  },

  handleLoginClicked: function(e) {
    var ref = window.Fbase.getRef();
    var self = this;
    ref.authWithPassword({
      "email": this.state.email,
      "password": this.state.password
      }, function (error, authData) {
        if (error) {
          Fbase.log({error:JSON.stringify(error), email: self.state.email}, "error", "login");
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
    this.setState({isOpen:false});
  },
  fblogin() {
    // <button type="button" className="btn btn-primary loginButton fbLogin" onClick={this.handleFacebookLoginClicked}>.</button>
    return null;
  },
  onLoginClick() {
    if (!Fbase.authUid) {
      this.setState({isOpen:true})
    } else {
      var ref = window.Fbase.getRef();
      ref.unauth();
      location.reload();
    }
  },
  getLink() {
    if (Fbase.authUid) {
      return (<Link className="loginText" to={"/player/0/"+Fbase.authUid}>{Caching.getDisplayName(Fbase.authUid).split(" ")[0]}</Link>);
    } else {
      return(<a className="loginText" onClick={this.onLoginClick}>Login</a>);
    }
  },
  render: function() {
    var modelStyle = {
      content: {
        padding: "20px 0",
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px"
      }
    }
    return (
      <div>
        {this.getLink()}
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          isOpen={this.state.isOpen}
          style={modelStyle}
          onRequestClose={this.handleModalCloseRequest}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title centerContainer">Tennis Database</h4>
            </div>
            <div className="modal-body centerContainer">
            <Tabs tabActive={1} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
              <Tabs.Panel title='Login'>
                <table className="wholerow">
                  <tbody><tr>
                    <td className="rightalign"> Email: </td>
                    <td>
                      <input key="email" onChange={this.onEmailChange} />
                    </td>
                    </tr><tr>
                    <td className="rightalign"> Password: </td>
                    <td>
                      <input key="password" type="password" onChange={this.onPasswordChange} />
                    </td>
                  </tr></tbody>
                </table>
                <div className="modal-footer centerContainer">
                  <button type="button" className="btn btn-primary loginButton" onClick={this.handleLoginClicked}>Login</button>
                  <button type="button" className="btn btn-primary nologinButton" onClick={this.handleModalCloseRequest}>Visit as guest</button>
                </div>
              </Tabs.Panel>
              <Tabs.Panel title="Sign up">
                <table className="wholerow">
                  <tbody><tr>
                    <td className="rightalign"> Email: </td>
                    <td>
                      <input key="email" onChange={this.onEmailChange} />
                    </td>
                    </tr><tr>
                    <td className="rightalign"> Password: </td>
                    <td>
                      <input key="password" type="password" onChange={this.onPasswordChange} />
                    </td>
                    </tr><tr>
                    <td className="rightalign"> Username: </td>
                    <td>
                      <input key="displayName" onChange={this.onDisplayNameChange} />
                    </td>
                  </tr></tbody>
                </table>
                <div className="modal-footer centerContainer rightalign">
                  <button type="button" className="btn btn-primary loginButton" onClick={this.handleRegisterClicked}>Register</button>
                </div>
              </Tabs.Panel>
            </Tabs>
            </div>

          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = Login;
