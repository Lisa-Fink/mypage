import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

import '../styles/signup.css';

const SignUp = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfRef = useRef();

  const { signup } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO check if password is long enough
    // check if passwords match
    if (passwordRef.current.value !== passwordConfRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      error && setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
    } catch {
      setError('Failed to create an account');
    }
    setLoading(false);
  };

  return (
    <div className="sign-up">
      <h2>Sign Up</h2>
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

        <div>
          <label>Confirm Password</label>
          <input type="password" required ref={passwordConfRef}></input>
        </div>

        <button disabled={loading} type="submit">
          Sign Up
        </button>
      </form>
      <div>
        Already have an account? <Link to="/login">Sign-In</Link>
      </div>
    </div>
  );
};

export default SignUp;
