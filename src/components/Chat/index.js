import React, { useState, useEffect, useCallback } from 'react';
import firebase from '../../services/firebase';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import CurrentChats from './ChatList';
import MessageBoard from './MessageBoard';
import NewChatForm from './NewChatForm';

function Chat({ history, currentUser, isLogedIn }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newChatFormVisible, setNewChatFormVisible] = useState(true);
  const [chats, setChats] = useState();

  /**
   * Check if user is logged in, if not redirect to login
   */
  useEffect(() => {
    if (!isLogedIn) {
      history.push('/');
    }
  }, [isLogedIn, history]);

  /**
   * Load user current chats into state
   *
   */

  const loadChats = useCallback(async () => {
    await firebase
      .firestore()
      .collection('chats')
      .where('users', 'array-contains', currentUser.username)
      .onSnapshot(async (res) => {
        const chatList = await res.docs.map((doc) => doc.data());
        setChats(chatList);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser, loadChats]);

  //Sign Out

  const signOut = () => {
    firebase.auth().signOut();
    history.push('/');
    localStorage.clear();
  };

  /**
   * render new chat form to create a new chat
   */

  const renderNewChatForm = () => {
    setNewChatFormVisible(true);
    setSelectedChat(null);
  };

  /**
   * set the index of the selected chat
   * @param {number} index from the currentchats component
   * @return {number}
   */

  const selectChat = (chatIndex) => {
    setSelectedChat(chatIndex);
    setNewChatFormVisible(false);
  };

  /**
   * set the index of the selected chat
   * @param {number} index from the chatsList component
   * @return {boolean}
   */
  // const userClickedChatWhereNotSender = (chatIndex) => {
  //   const messages = chats[chatIndex].messages;
  //   return (
  //     messages[messages.length - 1].sender !== currentUser.username
  //   );
  // };
  /**
   * set the index of the selected chat
   * @param {string} message from the message board component
   *
   */

  const sendMessage = (message, dockey) => {
    // console.log(message, dockey);
    firebase
      .firestore()
      .collection('chats')
      .doc(dockey)
      .update({
        messages: firebase.firestore.FieldValue.arrayUnion({
          sender: currentUser.username,
          message,
          timeStamp: Date.now(),
        }),
        receiverHasRead: false,
      });
  };

  const goToChat = (dockey) => {
    const usersInChat = dockey.split(':');
    const chat = chats.find((chat) =>
      usersInChat.every((user) => chat.users.includes(user))
    );
    // console.log(chat);

    selectChat(chats.indexOf(chat));
  };

  const createNewChat = async (dockey) => {
    await firebase
      .firestore()
      .collection('chats')
      .doc(dockey)
      .set({
        receiverHasRead: false,
        users: dockey.split(':'),
        messages: [],
      });
    // await loadChats();
    // selectChat(chats.length - 1);
  };

  ///////////////////////
  //// *****RENDER********///////////
  //////////////////////
  return (
    <div className="chat">
      <div className="chat-top">
        <h1>CHATS</h1>
      </div>
      <div className="chat-bottom">
        <div className="chat-left">
          <div className="user-summary user-card">
            <Link to="/user/profile">
              {' '}
              <img src={require('../../img/empty.png')} alt="user" />
            </Link>
            <div>{currentUser && currentUser.username}</div>
            <button onClick={signOut} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
          <div className="new-chat">
            <button
              className="btn new-chat-btn"
              style={{
                width: '100%',
                margin: '0.5rem 0',
              }}
              onClick={renderNewChatForm}
            >
              Start A New Chat
            </button>
          </div>
          <CurrentChats
            selectChat={selectChat}
            chats={chats}
            currentUser={currentUser}
            selectedChatIndex={selectedChat}
          />
        </div>
        <div className="chat-right">
          {!newChatFormVisible && chats && (
            <MessageBoard
              currentUser={currentUser}
              chat={chats[selectedChat]}
              sendMessage={sendMessage}
            />
          )}
          {newChatFormVisible && (
            <NewChatForm
              currentUser={currentUser}
              goToChat={goToChat}
              createNewChat={createNewChat}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  isLogedIn: state.auth.isLogedIn,
});

export default connect(mapStateToProps)(Chat);
