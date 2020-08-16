import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
// import { makeStyles } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import { loadUser } from '../../actions';
import { connect } from 'react-redux';

// const useStyles = makeStyles((theme) => ({
//   input: {
//     fontSize: '16px',
//   },
// }));

function Login({ history, loadUser, isLogedIn }) {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [submissionError, setSubmissionError] = useState({
    status: false,
    message: 'Incorrect email or password, Please try again',
  });

  // const classes = useStyles();

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
      .catch((err) =>
        setSubmissionError({ ...submissionError, status: true })
      );
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
          <div className="error">
            {submissionError.status && submissionError.message}
          </div>
          <form className="login-form">
            <div className="input-wrapper">
              <input
                placeholder="Email"
                value={loginData.email}
                name="email"
                type="email"
                className="login-form-input"
                onChange={handleChange}
              />
              <label className="login-form-label">Email</label>
            </div>
            <div className="input-wrapper">
              <input
                placeholder="Enter Password"
                value={loginData.password}
                name="password"
                type="password"
                onChange={handleChange}
                className="login-form-input"
              />
              <label className="login-form-label">Password</label>
            </div>
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
