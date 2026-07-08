import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const checkAuth = async () => {
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
      console.error('Google login failed details:', err);
      throw err.response?.data?.error || 'Google login failed';
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
