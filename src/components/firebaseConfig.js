import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = firebase.initializeApp({
  apiKey: 'AIzaSyBLI61vNS1yRicWfNUz-NaLF6WZ76-CAmo',
  authDomain: 'mypage-15a7a.firebaseapp.com',
  projectId: 'mypage-15a7a',
  storageBucket: 'mypage-15a7a.appspot.com',
  messagingSenderId: '1093595915535',
  appId: '1:1093595915535:web:d0fd7215fc4a4c9da5ca7a',
});

export const auth = app.auth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
