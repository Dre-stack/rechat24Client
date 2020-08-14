import React, { useState } from 'react';

function ChatsList(props) {
  const [search, setSearch] = useState('');

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  /**
   * render User's Chat List
   */
  const renderChatList = () => {
    const {
      chats,
      currentUser,
      selectedChatIndex,
      selectChat,
    } = props;
    if (chats) {
      // console.log('chats', chats);
      return chats.map((chat, i) => (
        <div
          key={i}
          className={
            selectedChatIndex === i
              ? 'chart-card selected'
              : 'chart-card'
          }
          onClick={() => selectChat(i)}
        >
          <div className="image">
            <img src={require('../../img/empty.png')} alt="user" />
          </div>
          <div className="details">
            <div className="username">
              {
                chat.users.filter(
                  (user) => user !== currentUser.username
                )[0]
              }
            </div>
            {chat.messages.length > 0 && (
              <div className="last-message">
                {chat.messages[
                  chat.messages.length - 1
                ].message.substring(0, 30) + '...'}
              </div>
            )}
          </div>
        </div>
      ));
    }
  };

  return (
    <React.Fragment>
      <div className="chat-search">
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
      </div>
      <div>{renderChatList()}</div>
    </React.Fragment>
  );
}

export default ChatsList;
