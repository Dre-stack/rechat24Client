import React from 'react';
import { useHistory } from 'react-router-dom';
import firebase from '../../services/firebase';

function ChatsList(props) {
  // const [search, setSearch] = useState('');
  const history = useHistory();

  // const handleChange = (e) => {
  //   setSearch(e.target.value);
  // };

  // const fetchUser = async (username) => {
  //   firebase
  //     .firestore()
  //     .collection('users')
  //     .where('username', '==', username)
  //     .get()
  //     .then((querySnapShot) => {
  //       querySnapShot.forEach((doc) => {
  //         const userData = doc.data();
  //         return userData;
  //       });
  //     });
  // };

  const userSentLastMessage = (chatIndex) => {
    const chat = props.chats[chatIndex];
    const messages = chat.messages;
    if (
      messages &&
      messages.length > 0 &&
      messages[messages.length - 1].sender ===
        props.currentUser.username
    ) {
      return true;
    } else {
      return false;
    }
  };

  const setMessageRead = async (dockey) => {
    await firebase
      .firestore()
      .collection('chats')
      .doc(dockey)
      .update({ receiverHasRead: true });
  };

  const goToChat = (chatIndex) => {
    history.push(`/chats/${chatIndex}`);

    //check if user is NOT the sender of the last message in the current chat
    const chat = props.chats[chatIndex];

    if (!userSentLastMessage(chatIndex)) {
      const dockey = chat.users.sort().join(':');
      setMessageRead(dockey);
    }
  };

  /**
   * render User's Chat List
   */
  const renderChatList = () => {
    const { chats, currentUser } = props;
    if (chats) {
      return chats.map((chat, i) => {
        const friendUsername = chat.users.filter(
          (user) => user !== currentUser.username
        )[0];
        return (
          <div
            key={i}
            className={
              !chat.receiverHasRead && !userSentLastMessage(i)
                ? 'chat-card unread'
                : 'chat-card'
            }
            onClick={() => goToChat(i)}
          >
            <div className="image">
              <img src={require('../../img/empty.png')} alt="user" />
            </div>
            <div className="details">
              <div className="username">{friendUsername}</div>
              {chat.messages.length > 0 && (
                <div className="last-message">
                  {chat.messages[
                    chat.messages.length - 1
                  ].message.substring(0, 30) + '...'}
                </div>
              )}
            </div>
            {!chat.receiverHasRead && !userSentLastMessage(i) && (
              <div className="unread-icon">
                <i className="fas fa-envelope"></i>
              </div>
            )}
          </div>
        );
      });
    }
  };

  return (
    <div className="chat-list">
      {/* <div className="chat-search">
        <input
          name="search"
          placeholder="Search My Chats"
          value={search}
          onChange={handleChange}
          type="text"
        />
        <button>
          <i className="fas fa-search"></i>
        </button>
      </div> */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!props.chats && (
          <div style={{ width: '60%' }}>
            You do not have any chats yet, Click on New Chat and
            search for your friends by their usernames to start
            chatting
          </div>
        )}
      </div>
      <div className="chat-user-list">{renderChatList()}</div>
    </div>
  );
}

export default ChatsList;
