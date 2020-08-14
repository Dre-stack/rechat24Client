import React, { useState, useEffect, useRef } from 'react';
// import ScrollToBottom from 'react-scroll-to-bottom';
// import moment from 'moment';

function MessageBoard(props) {
  const [message, setMessage] = useState('');

  const messageBoardRef = useRef();
  /**
   * Load user current chats into state
   */
  useEffect(() => {
    const container = document.getElementById('messages');
    if (container) {
      container.scrollTo(0, container.scrollHeight);
    }
  }, [props.chat]);

  const renderMessages = () => {
    const { chat, currentUser } = props;
    if (chat && currentUser) {
      return chat.messages.map((item, i) => (
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
    const { chat, currentUser } = props;
    e.preventDefault();
    if (validateMessage(message)) {
      const docKey = buildChatDocKey(
        chat.users.filter(
          (username) => username !== currentUser.username
        )[0]
      );
      props.sendMessage(message, docKey);
      setMessage('');
    }
  };

  return (
    <div
      className="message-board"
      ref={messageBoardRef}
      id="messages"
    >
      <div className="messages">{renderMessages()}</div>
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
  );
}

export default MessageBoard;
