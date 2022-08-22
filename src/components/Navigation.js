import { doc, onSnapshot } from 'firebase/firestore';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from './firebaseConfig';

import '../styles/navigation.css';

const Navigation = () => {
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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
      const first = doc.data().first;
      const last = doc.data().last;
      setName(`${first} ${last}`);
    });

  const userMenu = (
    <div id="user-menu">
      <div>
        <Link to="/update-account">Update Account</Link>
      </div>
      <div>
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );

  const userDiv = (
    <>
      <div>Profile</div>
      <div>Friends</div>
      <div> Friend Requests</div>
      <div
        className="user-info"
        onClick={() => {
          setShowMenu(!showMenu);
        }}
        onMouseOver={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div id="user-info-nav">
          {currentUser && (
            <img className="profile-pic" src={photo} alt="profile" />
          )}
          {currentUser && name}
        </div>
        {showMenu && userMenu}
      </div>
      {error && <div>error</div>}
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
