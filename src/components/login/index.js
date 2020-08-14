import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
// import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import { loadUser } from '../../actions';
import { connect } from 'react-redux';

// const useStyles = makeStyles((theme) => ({
//   input: {
//     background: 'white',
//   },
// }));

function Login({ history, loadUser, isLogedIn }) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Check if User is Logged in

  useEffect(() => {
    if (isLogedIn) {
      history.push('/chat');
    }
  }, [isLogedIn, history]);

  // handle TextField Change

  const handleChange = (e) => {
    const { value, name } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  /// log in user on submit

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = loginData;
    if (!email && !password) return;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        let user = data.user;
        if (user) {
          firebase
            .firestore()
            .collection('users')
            .where('id', '==', user.uid)
            .get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                const currentData = doc.data();
                loadUser(currentData);
              });
            });
        }
        history.push('/chat');
      })
      .catch((err) => console.log('login error', err));
  };

  return (
    <div className="login">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="logo-box">
            <img
              src={require('../../img/Rechat.png')}
              alt="rechat logo"
            />
          </div>
        </div>
        <div className="login-right">
          <div className="login-title">Log In</div>
          <form className="login-form">
            <TextField
              label="Enter Email"
              variant="filled"
              value={loginData.email}
              name="email"
              type="text"
              onChange={handleChange}
            />
            <TextField
              label="Enter Password"
              variant="filled"
              value={loginData.password}
              name="password"
              type="password"
              onChange={handleChange}
            />
            <button
              className="btn"
              onClick={handleSubmit}
              type="submit"
            >
              {' '}
              Log In{' '}
            </button>
          </form>
          <div className="login-foot">
            <div>Don't have an account?</div>
            <div>
              <Link className="btn link btn-secondary" to="/signup">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  isLogedIn: state.auth.isLogedIn,
});

export default connect(mapStateToProps, { loadUser })(Login);
