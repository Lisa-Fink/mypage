import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import '../styles/signup.css';

const SignUp = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfRef = useRef();

  const { currentUser, updateEmail, updatePassword } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO check if password is long enough
    // check if passwords match
    if (passwordRef.current.value !== passwordConfRef.current.value) {
      return setError('Passwords do not match');
    }

    const promises = [];
    setLoading(true);
    setError('');
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }
    Promise.all(promises)
      .then(() => {
        navigate('/');
      })
      .catch(() => {
        setError('Failed to update account');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="sign-container">
      <div className="sign-up">
        <h2>Update Account</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="sign-up-form">
          <div className="form-div">
            <label>
              Email
              <input
                type="email"
                required
                ref={emailRef}
                defaultValue={currentUser.email}
              ></input>
            </label>
          </div>

          <div className="form-div">
            <label>
              Password
              <input
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
              ></input>
            </label>
          </div>

          <div className="form-div">
            <label>
              Confirm Password
              <input
                type="password"
                ref={passwordConfRef}
                placeholder="Leave blank to keep the same"
              ></input>
            </label>
          </div>

          <button disabled={loading} type="submit">
            Update Account
          </button>
        </form>
        <div>
          <Link to="/">Cancel</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
