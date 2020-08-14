import React, { useState } from 'react';
import firebase from '../../services/firebase';

function NewChatForm(props) {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState();
  // console.log(user);

  const searchUsers = () => {
    firebase
      .firestore()
      .collection('users')
      .where('username', '==', search)
      .get()
      .then((querySnapShot) => {
        querySnapShot.forEach((doc) => {
          setUser(doc.data());
        });
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  const chatExists = async (dockey) => {
    const chat = await firebase
      .firestore()
      .collection('chats')
      .doc(dockey)
      .get();
    return chat.exists;
  };

  /**
   * start a new Chat
   * @param {string} username from the message board component
   *
   */

  const startNewChat = async (username) => {
    //check if current user has an exising chat with the new user
    const dockey = [props.currentUser.username, username]
      .sort()
      .join(':');
    const existingChat = await chatExists(dockey);
    // console.log(existingChat);

    if (existingChat) {
      props.goToChat(dockey);
    } else {
      props.createNewChat(dockey);
    }
  };

  const renderUsers = () => {
    if (user) {
      return (
        <div
          className="user"
          onClick={() => startNewChat(user.username)}
        >
          <img src={require('../../img/empty.png')} alt="user" />
          <div>{user.username}</div>
        </div>
      );
    }
  };

  return (
    <div className="new-chart">
      <div className="user-search">
        <input
          name="search"
          placeholder="Search Users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
        />
        <button onClick={searchUsers}>
          <i className="fas fa-search"></i>
        </button>
      </div>
      <React.Fragment>{renderUsers()}</React.Fragment>
    </div>
  );
}

export default NewChatForm;
