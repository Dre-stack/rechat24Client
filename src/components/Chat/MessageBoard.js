import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { connect } from 'react-redux';
// import moment from 'moment';
import firebase from '../../services/firebase';
import { loadUser } from '../../actions';

function MessageBoard(props) {
  const [message, setMessage] = useState('');
  const [friendUserName, setFriendUserName] = useState('');
  const [friendData, setFriendData] = useState();
  const chatIndex = props.match.params.index;

  const messageBoardRef = useRef();
  /**
   * Load user current chats into state
   */
  useEffect(() => {
    const container = document.getElementById('messages');
    if (container) {
      container.scrollTo(0, container.scrollHeight);
    }
  }, [props.chats]);

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
    firebase
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

  useEffect(() => {
    getFriendUserName();
  }, [getFriendUserName]);

  useEffect(() => {
    if (friendUserName) {
      loadUser(friendUserName);
    }
  }, [loadUser]);

  const renderMessages = () => {
    const { chats, currentUser } = props;
    if (chats && currentUser) {
      // console.log(chats);
      return chats[chatIndex].messages.map((item, i) => (
        <div
          key={i}
          className={
            item.sender === currentUser.username
              ? 'message me'
              : 'message you'
          }
        >
          {item.message}
          {/* <h3>{item.timeStamp.seconds}</h3> */}
        </div>
      ));
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
   * check if the message is valid before sending
   * @param {string} username from the current chat partner
   * @returns {string} chat document key for firebase
   */

  const buildChatDocKey = (friendUserName) => {
    return [props.currentUser.username, friendUserName]
      .sort()
      .join(':');
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
   * Send Message
   */

  const handleSubmit = (e) => {
    const { chats, currentUser } = props;
    e.preventDefault();
    if (validateMessage(message)) {
      const docKey = buildChatDocKey(
        chats[chatIndex].users.filter(
          (username) => username !== currentUser.username
        )[0]
      );

      firebase
        .firestore()
        .collection('chats')
        .doc(docKey)
        .update({
          messages: firebase.firestore.FieldValue.arrayUnion({
            sender: currentUser.username,
            message,
            timeStamp: Date.now(),
          }),
          receiverHasRead: false,
        });

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
