import { AUTH_FAIL, AUTH_SUCCESS } from '../actions/types';
const initial_state = {
  isLogedIn: false,
};

export default (state = initial_state, action) => {
  const { type } = action;
  switch (type) {
    case AUTH_SUCCESS:
      return { ...state, isLogedIn: true };
    case AUTH_FAIL:
      return { ...state, isLogedIn: false };

    default:
      return state;
  }
};
