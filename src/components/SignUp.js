import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

import '../styles/signup.css';

const SignUp = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfRef = useRef();
  const firstNameRef = useRef();
  const lastNameRef = useRef();

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
      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        firstNameRef.current.value,
        lastNameRef.current.value
      );
    } catch {
      setError('Failed to create an account');
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
        <h2>Sign Up</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="sign-up-form">
          <div className="form-div">
            <label>
              <div>First Name</div>
              <input type="text" required ref={firstNameRef}></input>
            </label>

            <label>
              <div>Last Name</div>
              <input type="text" required ref={lastNameRef}></input>
            </label>
          </div>
          <div className="form-div">
            <label>
              <div>Email</div>
              <input type="email" required ref={emailRef}></input>
            </label>
          </div>

          <div className="form-div">
            <label>
              <div>Password</div>
              <input type="password" required ref={passwordRef}></input>
            </label>

            <label>
              <div>Confirm password</div>
              <input type="password" required ref={passwordConfRef}></input>
            </label>
          </div>

          <button disabled={loading} type="submit">
            Sign Up
          </button>
        </form>
        <div>
          Already have an account? <Link to="/login">Sign-In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
