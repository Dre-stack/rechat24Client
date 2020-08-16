import React, { useState, useEffect, useCallback } from 'react';
import firebase from '../../services/firebase';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import CurrentChats from './ChatList';
// import MessageBoard from './MessageBoard';
import NewChatForm from './NewChatForm';
import { getUserChatToState } from '../../actions';

function Chat({
  history,
  currentUser,
  isLogedIn,
  getUserChatToState,
}) {
  const [chats, setChats] = useState();
  const [showNewChatForm, setShowNewChatForm] = useState(false);

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
        getUserChatToState(chatList);
      });
  }, [currentUser, getUserChatToState]);

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
   * load chats after adding new chat
   */

  const setNewChat = async (dockey) => {
    await loadChats();
    setShowNewChatForm(false);
  };

  /**
   * set the index of the selected chat
   * @param {number} index from the currentchats component
   * @return {number}
   */

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

  ///////////////////////
  //// *****RENDER********///////////
  //////////////////////
  return (
    <div className="chat">
      <div className="chat-wrapper">
        <div className="chat-top">
          <div className="user-summary ">
            <Link
              to={
                currentUser ? `/user/${currentUser.username}` : '##'
              }
            >
              {' '}
              <img
                src={
                  currentUser && currentUser.url
                    ? currentUser.url
                    : require('../../img/empty.png')
                }
                alt="user"
              />
            </Link>
            <div>
              <div className="username">
                {currentUser && currentUser.username}
              </div>
            </div>
          </div>
          <h1>CHATS</h1>
          <button
            className="btn new-chat-btn"
            onClick={() => setShowNewChatForm(true)}
          >
            New Chat
          </button>
        </div>
        <div className="chat-content">
          {!showNewChatForm && (
            <CurrentChats chats={chats} currentUser={currentUser} />
          )}
          {showNewChatForm && (
            <NewChatForm
              setNewChat={setNewChat}
              goBack={setShowNewChatForm}
            />
          )}
        </div>
        <button
          className="btn btn-secondary sign-out"
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentUser: state.user.currentUser,
  isLogedIn: state.auth.isLogedIn,
});

export default connect(mapStateToProps, { getUserChatToState })(Chat);
