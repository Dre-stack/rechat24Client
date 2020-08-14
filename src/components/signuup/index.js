import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
// import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

function Signup({ history, isLogedIn }) {
  const [signupData, setsignupData] = useState({
    email: '',
    password: '',
    username: '',
    error: '',
  });

  // CHeck if user is alreay loged in

  useEffect(() => {
    if (isLogedIn) {
      history.push('/chat');
    }
  }, [isLogedIn, history]);

  const handleChange = (e) => {
    const { value, name } = e.target;
    setsignupData({ ...signupData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = signupData;
    if (!username || !email || !password) return;
    try {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async (data) => {
          firebase
            .firestore()
            .collection('users')
            .add({
              username,
              id: data.user.uid,
              email,
              url: '',
            })
            .then((docref) => {
              setsignupData({
                username: '',
                password: '',
                email: '',
              });
              history.push('/chat');
            })
            .catch((err) => console.log('error adding doc', err));
        });
    } catch (err) {
      console.log(err);
    }
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
          <div className="login-title">Sign Up</div>

          <form className="login-form">
            <TextField
              label="Email"
              variant="standard"
              value={signupData.email}
              name="email"
              type="text"
              onChange={handleChange}
            />
            <TextField
              label="Password"
              variant="standard"
              value={signupData.password}
              name="password"
              type="password"
              onChange={handleChange}
            />
            <TextField
              label="Username"
              variant="standard"
              value={signupData.username}
              name="username"
              type="text"
              onChange={handleChange}
            />
            <button
              onClick={handleSubmit}
              type="submit"
              className="btn"
            >
              {' '}
              Signup{' '}
            </button>
          </form>

          <div className="login-foot">
            <div>Do you have an account?</div>
            <Link to="/" className="btn link btn-secondary">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  isLogedIn: state.auth.isLogedIn,
});

export default connect(mapStateToProps)(Signup);
