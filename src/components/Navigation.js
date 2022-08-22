import { doc, onSnapshot } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebaseConfig';

import '../styles/navigation.css';

const Navigation = () => {
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');

  const { currentUser, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('Failed to log out');
    }
  };

  currentUser &&
    onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      setPhoto(doc.data().profilePic);
    });

  const userDiv = (
    <>
      <div>Profile</div>
      <div>Friends</div>
      <div> Friend Requests</div>
      <div className="user-info">
        {currentUser && currentUser.email}
        {currentUser && (
          <img className="profile-pic" src={photo} alt="profile" />
        )}
      </div>
      {error && <div>error</div>}

      <button onClick={handleLogout}>Log Out</button>
    </>
  );
  return (
    <nav>
      <div id="logo">
        <h2>MyPage</h2>
      </div>

      <div id="user-div">{currentUser && userDiv}</div>
    </nav>
  );
};

export default Navigation;
