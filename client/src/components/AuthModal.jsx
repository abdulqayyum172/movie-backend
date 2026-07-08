import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Chrome, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', initialEmail = '' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({ username: '', email: initialEmail, password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (initialEmail) {
      setFormData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (mode === 'register') {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      const message = typeof err === 'string' ? err : err.message || 'An unexpected error occurred';
      setErrors({ server: message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setErrors({ server: typeof err === 'string' ? err : 'Google login failed' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({ username: '', email: '', password: '' });
    setShowPassword(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Sign in to your CineStream account' 
              : 'Join the community of movie lovers'}
          </p>
        </div>

        {errors.server && <div className="auth-error-banner">{errors.server}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className={`input-field ${errors.username ? 'has-error' : ''}`}>
              <label>Username</label>
              <div className="input-wrapper">
                <UserIcon size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="johndoe" 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  disabled={loading}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
          )}
          
          <div className={`input-field ${errors.email ? 'has-error' : ''}`}>
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className={`input-field ${errors.password ? 'has-error' : ''}`}>
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR CONTINUE WITH</span>
        </div>

        <button 
          type="button" 
          className="google-auth-btn" 
          onClick={handleGoogleSignIn} 
          disabled={loading}
        >
          <Chrome size={18} /> Google
        </button>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>New to CineStream? <button onClick={toggleMode} className="auth-mode-toggle">Create an account</button></p>
          ) : (
            <p>Already have an account? <button onClick={toggleMode} className="auth-mode-toggle">Sign in instead</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
