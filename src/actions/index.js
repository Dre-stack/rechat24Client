import { LOAD_USER, AUTH_FAIL, AUTH_SUCCESS } from './types';

export const loadUser = (userdata) => {
  return {
    type: LOAD_USER,
    payload: userdata,
  };
};

export const authSuccess = () => ({ type: AUTH_SUCCESS });
export const authFail = () => ({ type: AUTH_FAIL });
