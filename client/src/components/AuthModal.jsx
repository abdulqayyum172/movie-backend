import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Chrome, Eye, EyeOff, Loader2, Sparkles, Film } from 'lucide-react';
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
      const result = await loginWithGoogle();
      // null means the user closed/cancelled the popup — don't show an error
      if (result !== null && result !== undefined) {
        onClose();
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : err.message || 'Google sign-in failed. Please try again.';
      setErrors({ server: message });
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
    <div className="auth-overlay" onClick={onClose}>
      <div className={`auth-card ${mode}`} onClick={e => e.stopPropagation()}>
        {/* Decorative background orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Left branding panel (desktop only) */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <Film size={36} />
              <span>Cine<em>Stream</em></span>
            </div>
            <h2>{mode === 'login' ? 'Welcome back!' : 'Join the experience'}</h2>
            <p>Stream unlimited movies & shows in stunning quality. Your cinematic journey awaits.</p>
            <div className="auth-brand-features">
              <div className="auth-brand-feature">
                <Sparkles size={16} />
                <span>4K Ultra HD</span>
              </div>
              <div className="auth-brand-feature">
                <Film size={16} />
                <span>50,000+ Titles</span>
              </div>
            </div>
          </div>
          <div className="auth-brand-glow" />
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          {/* Mobile drag handle */}
          <div className="auth-drag-handle" />

          <div className="auth-form-header">
            <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
            <p>
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : 'Start your free cinematic journey'}
            </p>
          </div>

          {errors.server && <div className="auth-error-banner">{errors.server}</div>}

          {/* Google button first for better UX */}
          <button
            type="button"
            className="google-auth-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === 'register' && (
              <div className={`input-field ${errors.username ? 'has-error' : ''}`}>
                <div className="input-wrapper">
                  <UserIcon size={18} className="input-icon" />
                  <input
                    id="auth-username"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
            )}

            <div className={`input-field ${errors.email ? 'has-error' : ''}`}>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className={`input-field ${errors.password ? 'has-error' : ''}`}>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? <Loader2 className="animate-spin" size={20} />
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-footer">
            {mode === 'login' ? (
              <p>New to CineStream? <button onClick={toggleMode} className="auth-mode-toggle">Create an account</button></p>
            ) : (
              <p>Already have an account? <button onClick={toggleMode} className="auth-mode-toggle">Sign in</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
