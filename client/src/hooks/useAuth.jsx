import React, { createContext, useContext, useState, useEffect } from 'react';

import axios from 'axios';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  let apiBase = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? '' 
      : 'https://cinestream-backend-4vg0.onrender.com');
      
  if (apiBase.endsWith('/')) {
    apiBase = apiBase.slice(0, -1);
  }
  axios.defaults.baseURL = apiBase;

  useEffect(() => {
    const checkAuth = async () => {
      // Handle Google redirect result first (fires after signInWithRedirect)
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          const { user: firebaseUser } = redirectResult;
          console.log('Google redirect login successful, syncing with backend:', firebaseUser.email);
          const response = await axios.post('/api/auth/google', {
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL
          });
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(user);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Google redirect result error:', err);
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Auth verification failed', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      console.log('Login successful:', user);
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      throw err.response?.data?.error || 'Login failed';
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await axios.post('/api/auth/register', { username, email, password });
      const { user, token } = response.data;
      console.log('Registration successful:', user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      console.error('Registration error:', err);
      throw err.response?.data?.error || 'Registration failed';
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google login...');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = result;
      console.log('Firebase login successful, syncing with backend:', firebaseUser.email);
      
      // Send to backend to get/create local user and get JWT
      const response = await axios.post('/api/auth/google', {
        email: firebaseUser.email,
        username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL
      });
      
      const { user, token } = response.data;
      console.log('Backend sync successful:', user);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      const code = err.code || '';

      // User deliberately closed the popup — treat as silent cancel, not an error
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        console.info('Google sign-in cancelled by user.');
        return null; // return null so callers know it was cancelled
      }

      // Popup was blocked by the browser — fall back to redirect flow
      if (code === 'auth/popup-blocked') {
        console.warn('Popup blocked, falling back to redirect sign-in...');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithRedirect(auth, provider);
        // signInWithRedirect navigates away; result is handled in useEffect on return
        return;
      }

      console.error('Google login failed details:', err);
      throw err.response?.data?.error || err.message || code || 'Google login failed';
    }
  };

  const setupRecaptcha = () => {};
  const sendOtp = async () => {
    alert('Phone login is not yet implemented in the custom backend.');
    throw new Error('Feature not implemented');
  };

  return (
    <AuthContext.Provider value={{
      user, login, register, loginWithGoogle, sendOtp, setupRecaptcha, logout, loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
