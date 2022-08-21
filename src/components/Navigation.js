import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import '../styles/navigation.css';

const Navigation = () => {
  const [error, setError] = useState('');

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

  const userDiv = (
    <>
      <div>Profile</div>
      <div>Friends</div>
      <div> Friend Requests</div>
      <div>{currentUser && currentUser.email}</div>
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
