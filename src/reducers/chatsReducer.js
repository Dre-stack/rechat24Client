import { USER_CHATS_TO_STATE } from '../actions/types';

const initial_state = {
  chats: null,
};

export default (state = initial_state, action) => {
  const { type, payload } = action;

  switch (type) {
    case USER_CHATS_TO_STATE:
      return {
        ...state,
        chats: payload,
      };

    default:
      return state;
  }
};
