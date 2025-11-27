import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure light mode on landing page
    document.body.classList.remove('light-mode');
    document.body.classList.add('landing-page');
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#000000';
    return () => {
      document.body.classList.remove('landing-page');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="brand">
          Aadat<span className="gradient-dot"></span>
        </div>
        <Link to="/login" className="sign-in">Sign in</Link>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-badge-wrapper">
            <span className="hero-badge">
              <span className="live-indicator"></span>
              50,000+ users building better habits
            </span>
          </div>
          
          <h1 className="hero-title">
            Build habits that
            <br />
            <span className="neon-text">actually stick</span>
          </h1>
          
          <p className="hero-subtitle">
            The habit tracker designed for people who are tired of broken streaks.<br />
            Simple. Powerful. Built for consistency.
          </p>
          
          <div className="hero-actions">
            <Link to="/login" className="btn-primary-new">
              Get started free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Link>
            <button className="btn-secondary-new">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7l5 3-5 3V7z" fill="currentColor"/>
              </svg>
              Watch demo
            </button>
          </div>

          {/* STATS BAR */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">127K</div>
              <div className="stat-label">Habits tracked</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">89%</div>
              <div className="stat-label">Success rate</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">4.9★</div>
              <div className="stat-label">User rating</div>
            </div>
          </div>

          {/* HERO DASHBOARD PREVIEW */}
          <div className="hero-dashboard">
            <div className="dashboard-window">
              <div className="window-header">
                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="window-title">Dashboard</div>
                <div className="window-actions"></div>
              </div>
              <div className="window-content">
                <div className="streak-display">
                  <div className="streak-icon-large">🔥</div>
                  <div className="streak-number-large">127</div>
                  <div className="streak-label">Day Streak</div>
                </div>

                <div className="habits-today">
                  <div className="habits-header">
                    <span>Today</span>
                    <span className="habits-count">3/5 completed</span>
                  </div>
                  <div className="habit-item done">
                    <div className="habit-check">✓</div>
                    <div className="habit-name">Morning meditation</div>
                    <div className="habit-streak">47🔥</div>
                  </div>
                  <div className="habit-item done">
                    <div className="habit-check">✓</div>
                    <div className="habit-name">Drink 2L water</div>
                    <div className="habit-streak">11🔥</div>
                  </div>
                  <div className="habit-item done">
                    <div className="habit-check">✓</div>
                    <div className="habit-name">Read 30 minutes</div>
                    <div className="habit-streak">23🔥</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <span className="section-badge">FEATURES</span>
            <h2>Everything you need to succeed</h2>
            <p className="section-subtitle">Powerful features designed by habit experts</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Streak Tracking</h3>
              <p>Watch your consistency grow with visual streak counters that motivate you daily.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community Support</h3>
              <p>Join a supportive community of habit builders who celebrate your wins.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Analytics</h3>
              <p>Get detailed insights into your habit patterns with beautiful charts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Achievements</h3>
              <p>Unlock badges and achievements as you hit milestones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <div className="cta-content-new">
            <h2>Start building habits that last</h2>
            <p>Join thousands who've already transformed their lives</p>
          </div>
          <div className="cta-actions-new">
            <Link to="/login" className="btn-primary-new">
              Get started free
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
          <div className="cta-fine-print">
            <span>✓ No credit card required</span>
            <span>✓ 14-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-new">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-footer">Aadat<span className="neon-dot"></span></div>
            <p>Build habits that actually stick</p>
          </div>
          <div className="footer-links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Support</a>
          </div>
          <div className="footer-bottom">
            <span>© 2025 Aadat. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
