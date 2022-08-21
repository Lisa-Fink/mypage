import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import '../styles/signup.css';

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();

  const { login } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      error && setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch {
      // TODO show error reason
      setError('Failed to sign in');
    }
    setLoading(false);
  };

  return (
    <div className="sign-container">
      <div className="sign-left">
        <h1>MyPage</h1>
        <h2>Connect with the world on MyPage.</h2>
      </div>
      <div className="sign-up">
        <h2>Log In</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="sign-up-form">
          <div>
            <label>Email</label>
            <input type="email" required ref={emailRef}></input>
          </div>

          <div>
            <label>Password</label>
            <input type="password" required ref={passwordRef}></input>
          </div>

          <button disabled={loading} type="submit">
            Log In
          </button>
        </form>
        <div>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <div>
          Need an account? <Link to="/signup">Sign-up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
