import {
  LOAD_USER,
  AUTH_FAIL,
  AUTH_SUCCESS,
  USER_CHATS_TO_STATE,
} from './types';

export const loadUser = (userdata) => {
  return {
    type: LOAD_USER,
    payload: userdata,
  };
};
export const getUserChatToState = (chats) => {
  return {
    type: USER_CHATS_TO_STATE,
    payload: chats,
  };
};

export const authSuccess = () => ({ type: AUTH_SUCCESS });
export const authFail = () => ({ type: AUTH_FAIL });
