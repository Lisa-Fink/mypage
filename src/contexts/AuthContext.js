import React, { useContext, useEffect, useState, useRef } from 'react';
import { auth, db } from '../components/firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';

const AuthContext = React.createContext();

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  const nameRef = useRef([]);

  const signup = (email, password, first, last) => {
    // returns a promise
    nameRef.current = [first, last];
    return auth.createUserWithEmailAndPassword(email, password);
  };

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
  };

  const updateEmail = (email) => {
    return currentUser.updateEmail(email);
  };

  const updatePassword = (password) => {
    return currentUser.updatePassword(password);
  };

  const createUser = async (user) => {
    const date = new Date();
    const [month, day, year] = [
      date.getMonth(),
      date.getDate(),
      date.getFullYear(),
    ];
    await setDoc(doc(db, 'users', user.uid), {
      wall: [
        {
          date: `${month + 1}-${day}-${year}`,
          activity: 'MyPage account created',
        },
      ],
      first: nameRef.current[0],
      last: nameRef.current[1],
      profilePic:
        'https://firebasestorage.googleapis.com/v0/b/mypage-15a7a.appspot.com/o/m.png?alt=media&token=beb81183-12ad-44b7-938a-1fceee1da5fc',
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      // if it's a new account stores the first and last name
      nameRef.current.length > 0 && createUser(user);
      nameRef.current = [];

      setCurrentUser(user);

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <div>
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    </div>
  );
};

export { AuthProvider, useAuth };
