import React, { useState, useEffect, useCallback } from 'react';
import firebase from '../../services/firebase';
import { connect } from 'react-redux';

function UserProfile({
  currentUser,
  match: { params },
  showToast,
  history,
}) {
  const [user, setUser] = useState();
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormdata, setEditFormData] = useState({
    description: '',
    photo: '',
  });
  // const [photoUrl, setPhotoUrl] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const username = params.username;

  const loadUser = useCallback(async (username) => {
    firebase
      .firestore()
      .collection('users')
      .where('username', '==', username)
      .get()
      .then((querySnapShot) => {
        querySnapShot.forEach((doc) => setUser(doc.data()));
      });
  }, []);

  useEffect(() => {
    loadUser(username);
  }, [loadUser, username]);

  const editProfile = () => {
    setShowEditForm(true);
  };

  const validateForm = () => {
    const { description, photo } = editFormdata;
    if (!description && !photo) {
      setSubmissionError('No data to update');
      return false;
    }
    if (description.length > 100) {
      setSubmissionError(
        'Please Describe yourself with less than 100 Characters'
      );
      return false;
    }

    return true;
  };
  const uploadPhoto = async () => {
    const uploadTask = firebase
      .storage()
      .ref()
      .child(currentUser.username)
      .put(editFormdata.photo);

    uploadTask.on(
      'state_changed',
      null,
      (err) => setSubmissionError(err.message),
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          // setPhotoUrl(url);
          updateProfile(url, editFormdata.description);
        });
      }
    );
  };

  const updateProfile = (url, description) => {
    // console.log('this is the final data', url, description);
    let userInfo;
    if (url && description) {
      userInfo = {
        url,
        description,
      };
    } else if (description && !url) {
      userInfo = {
        description,
      };
    } else if (!description && url) {
      userInfo = {
        url,
      };
    }
    firebase
      .firestore()
      .collection('users')
      .doc(user.dockey)
      .update(userInfo)
      .then((data) => {
        // showToast(1, 'Profile Updated successfully');
        window.location.reload();
        setShowEditForm(false);
      });
  };

  const handleChange = (e) => {
    const value =
      e.target.name === 'photo' ? e.target.files[0] : e.target.value;

    setEditFormData({ ...editFormdata, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { description, photo } = editFormdata;

    const validForm = validateForm();

    if (validForm) {
      if (photo) {
        uploadPhoto();
      } else {
        updateProfile(null, description);
      }
    }
  };

  const renderEditForm = () => {
    return (
      <div className="edit-form">
        <div className="edit-error">
          {submissionError && submissionError}
        </div>
        <form>
          <label>About Me</label>
          <textarea
            type="text"
            name="description"
            value={editFormdata.description}
            onChange={handleChange}
          />
          <label>Choose Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            name="photo"
            onChange={handleChange}
          />
          <button onClick={handleSubmit} className="btn">
            update profile
          </button>
        </form>
      </div>
    );
  };

  const renderUser = () => {
    return (
      <div className="profile-content">
        <div className="profile-image">
          <img
            src={user.url ? user.url : require('../../img/empty.png')}
            alt=""
          />
        </div>
        <div className="description">
          <h3>About Me</h3>
          <p>{user.description && user.description}</p>
        </div>
        {currentUser && currentUser.username === user.username && (
          <div>
            <button className="btn" onClick={editProfile}>
              Edit Profile
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="profile">
      <div className="profile-wrapper">
        <div className="profile-top">
          <button
            className="btn btn-secondary"
            onClick={() => history.goBack()}
          >
            Go Back
          </button>
          <h1 className="username">{user && user.username}</h1>
        </div>
        {user && !showEditForm ? renderUser() : null}
        {showEditForm && renderEditForm()}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(UserProfile);
