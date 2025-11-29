import React, { useState } from 'react';
import styles from './Auth.module.css';

interface AuthProps {
  onLogin: (username: string, email: string, password: string) => void;
  onRegister: (username: string, email: string, password: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (isSignUp && !email.trim()) {
      setError('Email is required for sign up');
      return;
    }

    if (isSignUp && !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (isSignUp) {
      onRegister(username.trim(), email.trim(), password.trim());
    } else {
      onLogin(username.trim(), email.trim(), password.trim());
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Weekly School Time Tracker</h1>
          <p className={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className={styles.input}
              autoComplete="username"
            />
          </div>

          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={styles.input}
                autoComplete="email"
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={styles.input}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitButton}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          <div className={styles.toggleContainer}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPassword('');
              }}
              className={styles.toggleButton}
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
