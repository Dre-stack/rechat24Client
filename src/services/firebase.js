// import React from 'react';
import * as firebase from 'firebase';

//Firebase configuration

var firebaseConfig = {
  apiKey: 'AIzaSyDiKhqHIhyzVGwFPc0f8g-S7i4lxxMrg_c',
  authDomain: 'rechat-72b61.firebaseapp.com',
  databaseURL: 'https://rechat-72b61.firebaseio.com',
  projectId: 'rechat-72b61',
  storageBucket: 'rechat-72b61.appspot.com',
  messagingSenderId: '872828986722',
  appId: '1:872828986722:web:3bb6992320fbc0e85bf83b',
};
// Initialize Firebase

firebase.initializeApp(firebaseConfig);

export default firebase;
