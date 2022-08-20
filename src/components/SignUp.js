import React, { useRef, useState } from 'react';

import '../styles/signup.css';

const SignUp = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfRef = useRef();

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // check if passwords match
    if (passwordRef.current.value !== passwordConfRef.current.value) {
      return setError('Passwords do not match');
    }

    error && setError('');
    console.log('success');
    console.log(emailRef.current.value);
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

        <button type="submit">Sign Up</button>
      </form>
      <div>Already have an account? Sign-In</div>
    </div>
  );
};

export default SignUp;
