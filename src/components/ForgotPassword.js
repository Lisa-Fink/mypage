import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import '../styles/signup.css';

const ForgotPassword = () => {
  const emailRef = useRef();

  const { resetPassword } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      error && setError('');
      message && setMessage('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for further instructions');
    } catch {
      // TODO show error reason
      setError('Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="sign-container">
      <div className="sign-up">
        <h2>Reset Password</h2>
        {error && <div className="error">{error}</div>}
        {message && <div className="message">{message}</div>}
        <form onSubmit={handleSubmit} className="sign-up-form">
          <div>
            <label>Email</label>
            <input type="email" required ref={emailRef}></input>
          </div>

          <button disabled={loading} type="submit">
            Reset Password
          </button>
        </form>
        <div>
          <Link to="/login">Login</Link>
        </div>
        <div>
          Need an account? <Link to="/signup">Sign-up</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
