import React, { useState, useEffect } from 'react';
import firebase from '../../services/firebase';
// import { makeStyles } from '@material-ui/core/styles';
// import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

// const useStyles = makeStyles((theme) => ({
//   input: {
//     fontSize: '16px',
//   },
// }));

function Signup({ history, isLogedIn }) {
  const [signupData, setsignupData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [formError, setFormError] = useState({
    email: '',
    password: '',
    username: '',
  });
  // const classes = useStyles();

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

  const validateFormData = async () => {
    const { username, email, password } = signupData;
    if (!username || !email || !password) {
      setFormError({
        email: 'Required',
        password: 'Required',
        username: 'Required',
      });
      return false;
    }
    if (password.length < 6) {
      setFormError({
        password: 'Password must be more than six characters',
      });
      return false;
    }
    if (!/^[a-zA-Z]/.test(username)) {
      setFormError({
        username: 'Username must start with a letter',
      });
      return false;
    }
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email.toLowerCase())) {
      setFormError({ email: 'Please enter a valid emaiil' });
      return false;
    }

    const querySnapShot = await firebase
      .firestore()
      .collection('users')
      .where('username', '==', username)
      .get();
    if (querySnapShot.docs.length > 0) {
      setFormError({
        username: 'Username already exists, Please try again',
      });

      return false;
    }
    const emailSnapShot = await firebase
      .firestore()
      .collection('users')
      .where('email', '==', email)
      .get();
    if (emailSnapShot.docs.length > 0) {
      setFormError({
        email: 'Email already exists, Please try again',
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValidData = await validateFormData();
    if (isValidData) {
      const { username, email, password } = signupData;

      try {
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then(async (data) => {
            const ref = firebase
              .firestore()
              .collection('users')
              .doc();
            ref
              .set({
                id: data.user.uid,
                dockey: ref.id,
                username,
                email,
                url: '',
                description: '',
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
            // firebase
            //   .firestore()
            //   .collection('users')
            //   .add({
            //     username,
            //     id: data.user.uid,
            //     email,
            //     url: '',
            //   })
            //   .then((docref) => {
            //     setsignupData({
            //       username: '',
            //       password: '',
            //       email: '',
            //     });
            //     history.push('/chat');
            //   })
            //   .catch((err) => console.log('error adding doc', err));
          });
      } catch (err) {
        console.log('signup erorr', err);
      }
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
            <div className="input-wrapper">
              <input
                placeholder="Email"
                value={signupData.email}
                name="email"
                type="email"
                onChange={handleChange}
                className="login-form-input"
              />
              <label className="login-form-label">Email</label>
            </div>
            <div className="error">{formError.email}</div>
            <div className="input-wrapper">
              <input
                placeholder="Password"
                value={signupData.password}
                name="password"
                type="password"
                onChange={handleChange}
                className="login-form-input"
              />
            </div>
            <div className="error">{formError.password}</div>
            <div className="input-wrapper">
              <input
                placeholder="Username"
                value={signupData.username}
                name="username"
                type="text"
                onChange={handleChange}
                className="login-form-input"
              />
              <label className="login-form-label">Username</label>
            </div>
            <div className="error">{formError.username}</div>
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
