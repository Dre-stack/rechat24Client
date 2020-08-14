import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import firebase from './services/firebase';
import { toast, ToastContainer } from 'react-toastify';
import Login from './components/login';
import Signup from './components/signuup';
import Chat from './components/Chat';
import './sass/main.scss';
import { loadUser, authSuccess, authFail } from './actions';
import { connect } from 'react-redux';

function App({ loadUser, authSuccess, authFail, isLogedIn }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        authSuccess();
        firebase
          .firestore()
          .collection('users')
          .where('id', '==', user.uid)
          .get()
          .then((querrySnap) => {
            querrySnap.forEach((doc) => {
              const userData = doc.data();
              loadUser(userData);
            });
          });
        setLoading(false);
      } else {
        authFail();
        setLoading(false);
      }
    });
  }, [authFail, authSuccess, loadUser]);

  const showToast = (type, message) => {
    switch (type) {
      case 0:
        toast.warning(message);
        break;
      case 1:
        toast.success(message);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <Router>
        <ToastContainer
          autoClose={200}
          hideProgressBar={true}
          position={toast.POSITION.TOP_CENTER}
        />
        <Switch>
          <Route
            path="/"
            exact
            render={(props) => (
              <Login showToast={showToast} {...props} />
            )}
          />
          <Route
            path="/signup"
            exact
            render={(props) => (
              <Signup showToast={showToast} {...props} />
            )}
          />
          <Route
            path="/chat"
            exact
            render={(props) => (
              <Chat showToast={showToast} {...props} />
            )}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default connect(null, {
  loadUser,
  authFail,
  authSuccess,
})(App);
