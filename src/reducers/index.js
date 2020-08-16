import { combineReducers } from 'redux';
import userReducer from './userReducer';
import authReducer from './authReducer';
import chatsReducer from './chatsReducer';

export default combineReducers({
  user: userReducer,
  auth: authReducer,
  chats: chatsReducer,
});
