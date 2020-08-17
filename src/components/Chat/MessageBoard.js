import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import firebase from '../../services/firebase';

function MessageBoard(props) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState();
  const [friendUserName, setFriendUserName] = useState('');
  const [friendData, setFriendData] = useState();
  const chatIndex = props.match.params.index;

  const messageBoardRef = useRef();
  const photoInputRef = useRef();
  /**
   * Load user current chats into state
   */
  useEffect(() => {
    const container = document.getElementById('messages');
    if (container) {
      container.scrollTo(0, container.scrollHeight);
    }
  }, [chatMessages]);

  const getFriendUserName = useCallback(() => {
    const { chats, currentUser } = props;
    if (chats && currentUser) {
      const username = chats[chatIndex].users.filter(
        (user) => user !== currentUser.username
      )[0];

      setFriendUserName(username);
    }
  }, [chatIndex, props]);

  const loadUser = async (username) => {
    await firebase
      .firestore()
      .collection('users')
      .where('username', '==', username)
      .get()
      .then((querySnapShot) => {
        querySnapShot.forEach((doc) => {
          const userData = doc.data();
          setFriendData(userData);
        });
      });
  };

  /**
   * Load chat messages form store
   */

  const getChatMessages = useCallback(async () => {
    const { chats } = props;
    if (chats) {
      const chatkey = chats[chatIndex].dockey;
      await firebase
        .firestore()
        .collection('messages')
        .where('chatkey', '==', chatkey)
        .orderBy('timeStamp', 'asc')
        .onSnapshot(async (snapShot) => {
          let messages = [];
          await snapShot.docs.forEach((doc) =>
            messages.push(doc.data())
          );
          setChatMessages(messages);
          // console.log(messages);
        });
    }
  }, [props, chatIndex]);

  useEffect(() => {
    getFriendUserName();
    getChatMessages();
    if (friendUserName) {
      loadUser(friendUserName);
    }
  }, [getFriendUserName, friendUserName, getChatMessages]);

  const renderMessages = () => {
    const { currentUser } = props;
    if (chatMessages && currentUser) {
      // console.log(chats);
      return chatMessages.map((item, i) => {
        // {item.type === 0 ? }
        if (!item.type || item.type === 0) {
          return (
            <div
              key={i}
              className={
                item.sender === currentUser.username
                  ? 'message me'
                  : 'message you'
              }
            >
              {item.message}
              <h6>{moment(Number(item.timeStamp)).fromNow()}</h6>
            </div>
          );
        } else if (item.type === 1) {
          return (
            <div
              key={i}
              className={
                item.sender === currentUser.username
                  ? 'image me'
                  : 'image you'
              }
            >
              <img src={item.message} alt={`from ${item.sender}`} />
              <h6>{moment(Number(item.timeStamp)).fromNow()}</h6>
            </div>
          );
        }
      });
    }
  };

  /**
   * check if the message is valid before sending
   * @param {string}
   * @returns {boolean}
   */

  const validateMessage = (msg) => {
    return msg && msg.replace(/\s/g, '').length;
  };

  /**
   * pressing enter Key to send
   */

  const userTyping = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  /**
   * Send Photo
   */

  const sendPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadTask = firebase
      .storage()
      .ref()
      .child(props.currentUser.username + `message ${Date.now()}`)
      .put(file);

    uploadTask.on(
      'state_changed',
      null,
      (err) => {},
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          // setPhotoUrl(url);
          sendMessage(url, 1);
        });
      }
    );
  };

  /**
   * Send Message
   */
  const sendMessage = async (messageBody, type) => {
    const { chats, currentUser } = props;
    const chatkey = chats[chatIndex].dockey;

    await firebase.firestore().collection('messages').doc().set({
      sender: currentUser.username,
      message: messageBody,
      type,
      timeStamp: Date.now(),
      chatkey: chatkey,
      receiverHasRead: false,
    });

    //update the last message and sender field in the chat document

    await firebase
      .firestore()
      .collection('chats')
      .doc(chatkey)
      .update({
        lastMessage: messageBody,
        lastMessageSender: currentUser.username,
        receiverHasRead: false,
        lastMessageType: type,
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateMessage(message)) {
      sendMessage(message, 0);
      setMessage('');
    }
  };

  return (
    <div className="message-board" ref={messageBoardRef}>
      <div className="message-board-wrapper">
        <div className="message-top">
          <button
            onClick={() => props.history.push('/chat')}
            className="btn btn-secondary"
          >
            Go Back
          </button>
          <div
            className="user-summary"
            onClick={() =>
              props.history.push(`/user/${friendUserName}`)
            }
          >
            <img
              src={
                friendData && friendData.url
                  ? friendData.url
                  : require('../../img/empty.png')
              }
              alt="user"
            />

            <div>
              <div className="username">{friendUserName}</div>
            </div>
          </div>
        </div>

        <div className="messages" id="messages">
          {renderMessages()}
        </div>
        <div className="message-input">
          <form className="input-container" onSubmit={handleSubmit}>
            <div
              className="image-input"
              onClick={() => photoInputRef.current.click()}
            >
              <i className="fas fa-images fa-2x"></i>
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={photoInputRef}
              onChange={sendPhoto}
            />
            <textarea
              onKeyUp={userTyping}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type Your Message"
            />
            <button>
              <i className="far fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state) => ({
  chats: state.chats.chats,
  currentUser: state.user.currentUser,
});

export default connect(mapStateToProps)(MessageBoard);
