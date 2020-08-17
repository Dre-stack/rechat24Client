import React, { useState } from 'react';
import firebase from '../../services/firebase';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

function NewChatForm(props) {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState();
  const [userNotFoundError, setUserNotFoundError] = useState({
    status: false,
    message: '',
  });
  const history = useHistory();
  // console.log(user);

  const searchUsers = (e) => {
    e.preventDefault();
    firebase
      .firestore()
      .collection('users')
      .where('username', '==', search)
      .get()
      .then((querySnapShot) => {
        if (querySnapShot.docs.length > 0) {
          querySnapShot.forEach((doc) => {
            const user = doc.data();
            if (user.username !== props.currentUser.username) {
              setUserNotFoundError({ status: false, message: '' });
              setUser(user);
            } else {
              setUserNotFoundError({
                status: true,
                message: 'You cannot search for yourself',
              });
            }
          });
        } else {
          setUserNotFoundError({
            status: true,
            message: 'No user with that username, Please try again',
          });
        }
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
      //if there is an existing chat, navigate user to the chat
      const usersInChat = dockey.split(':');
      const chat = props.chats.find((chat) =>
        usersInChat.every((user) => chat.users.includes(user))
      );
      const chatIndex = props.chats.indexOf(chat);
      history.push(`/chats/${chatIndex}`);
    } else {
      //if no existing chat , create new chat and navigate user to the newchat
      firebase
        .firestore()
        .collection('chats')
        .doc(dockey)
        .set({
          receiverHasRead: false,
          users: dockey.split(':'),
          messages: [],
          dockey: dockey,
          lastMessage: '',
          lastMessageSender: '',
        })
        .then(async () => {
          props.setNewChat(dockey);
        });
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
      <button
        className="btn btn-secondary"
        onClick={() => props.goBack(false)}
      >
        Go Back
      </button>
      <form className="user-search">
        <input
          name="search"
          placeholder="Search Users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
        />
        <button type="submit" onClick={searchUsers}>
          <i className="fas fa-search"></i>
        </button>
      </form>
      <div style={{ padding: '2rem' }}>
        {userNotFoundError.status && userNotFoundError.message}
      </div>
      <React.Fragment>{renderUsers()}</React.Fragment>
    </div>
  );
}

const mapStateToProps = (state) => ({
  chats: state.chats.chats,
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(NewChatForm);
