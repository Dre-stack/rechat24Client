import { LOAD_USER } from '../actions/types';

const INITIAL_STATE = {
  currentUser: null,
  searchedUser: null,
  friends: null,
};

export default (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_USER:
      return {
        ...state,
        currentUser: payload,
      };
    default:
      return state;
  }
};
