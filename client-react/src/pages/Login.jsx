import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure dark mode on mount
    document.body.classList.remove('light-mode');
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (!isLogin && !formData.username) {
      setError('Username is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        navigate('/dashboard');
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.msg || err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <nav className="navbar">
        <Link to="/" className="brand">
          Aadat<span className="neon-dot"></span>
        </Link>
        <Link to="/" className="back-link">← Back to home</Link>
      </nav>

      <div className="auth-container">
        <div className="auth-content">
          {/* Left Side - Branding */}
          <div className="auth-branding">
            <div className="branding-content">
              <div className="brand-logo">
                <span className="logo-text">Aadat</span>
                <span className="neon-dot-large"></span>
              </div>
              <h1>Build habits that actually stick</h1>
              <p>Join 50,000+ users who are transforming their lives, one habit at a time.</p>
              
              <div className="auth-stats">
                <div className="auth-stat">
                  <div className="stat-num">50K+</div>
                  <div className="stat-txt">Active users</div>
                </div>
                <div className="auth-stat">
                  <div className="stat-num">2.1M</div>
                  <div className="stat-txt">Habits tracked</div>
                </div>
                <div className="auth-stat">
                  <div className="stat-num">89%</div>
                  <div className="stat-txt">Success rate</div>
                </div>
              </div>

              <div className="live-activity">
                <div className="live-pulse"></div>
                <span>127 people started their journey today</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="auth-forms">
            <div className="form-wrapper">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign in
                </button>
                <button 
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </button>
              </div>

              <div className="form-section active">
                <div className="form-header">
                  <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                  <p>
                    {isLogin 
                      ? 'Enter your credentials to access your account' 
                      : 'Start building better habits today'}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="input-group">
                      <label htmlFor="username">Username</label>
                      <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        placeholder="johndoe" 
                        value={formData.username}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label htmlFor="email">Email address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="you@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {!isLogin && (
                      <div className="password-hint">At least 8 characters</div>
                    )}
                  </div>

                  {error && (
                    <div className="error-message" style={{ 
                      color: '#ff4444', 
                      background: 'rgba(255, 68, 68, 0.1)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 68, 68, 0.3)'
                    }}>
                      {error}
                    </div>
                  )}

                  {isLogin && (
                    <div className="form-footer">
                      <label className="checkbox-label">
                        <input type="checkbox" name="remember" />
                        <span>Remember me</span>
                      </label>
                      <a href="#" className="forgot-link">Forgot password?</a>
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Create account')}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </form>
              </div>

              <div className="divider">
                <span>Or continue with</span>
              </div>

              <div className="social-buttons">
                <button className="social-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.2 8.3V12h5.3c-.2 1.2-1.4 3.5-5.3 3.5-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3 .8 3.7 1.4l2.9-2.8C14.6 1 12.6 0 10.2 0 4.6 0 0 4.6 0 10.2s4.6 10.2 10.2 10.2c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.1-1.7h-9.7z"/>
                  </svg>
                  Google
                </button>
                <button className="social-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              <p className="auth-terms">
                By continuing, you agree to our 
                <a href="#">Terms of Service</a> and 
                <a href="#">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
