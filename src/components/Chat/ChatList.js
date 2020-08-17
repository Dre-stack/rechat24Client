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

  const userSentLastMessage = (sender) => {
    if (sender === props.currentUser.username) {
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
      const dockey = chat.dockey;
      setMessageRead(dockey);
    }
  };

  const renderLastMessage = (chat) => {
    const { lastMessage, lastMessageType } = chat;
    if (
      lastMessage &&
      lastMessageType === 0 &&
      lastMessage.length > 30
    ) {
      return lastMessage.substring(0, 30) + '...';
    } else if (lastMessageType === 0 && lastMessage.length < 30) {
      return lastMessage;
    } else if (lastMessageType === 1) {
      return 'Image';
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
              !chat.receiverHasRead &&
              !userSentLastMessage(chat.lastMessageSender)
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

              <div className="last-message">
                {renderLastMessage(chat)}
              </div>
            </div>
            {!chat.receiverHasRead &&
              chat.lastMessageSender &&
              !userSentLastMessage(chat.lastMessageSender) && (
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
