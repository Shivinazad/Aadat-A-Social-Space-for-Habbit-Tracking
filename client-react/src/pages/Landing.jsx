import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FiArrowRight, FiPlay, FiCheck, FiTrendingUp, FiUsers, FiAward, FiZap } from 'react-icons/fi';
import axios from 'axios';

const Landing = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHabits: 0,
    totalCheckins: 0
  });

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
    // Fetch real statistics
    const fetchStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');
        const response = await axios.get(`${API_BASE_URL}/stats/public`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
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
      <motion.nav
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="brand">
          Aadat<span className="gradient-dot"></span>
        </div>
        <Link to="/login" className="sign-in">Sign in</Link>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-container">
          <motion.div
            className="hero-badge-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="hero-badge">
              <span className="live-indicator"></span>
              {stats.totalUsers > 0 ? `${stats.totalUsers.toLocaleString()}+ users` : 'Join our community'} building better habits
            </span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Build habits that
            <br />
            <span className="neon-text">actually stick</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            The habit tracker designed for people who are tired of broken streaks.<br />
            Simple. Powerful. Built for consistency.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/login" className="btn-primary-new">
              Get started free
              <FiArrowRight />
            </Link>
            <button className="btn-secondary-new">
              <FiPlay />
              Watch demo
            </button>
          </motion.div>

          {/* STATS BAR */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <div className="stat-item">
              <div className="stat-number">
                {stats.totalUsers > 0 ? <CountUp end={stats.totalUsers} duration={2.5} separator="," /> : '...'}
              </div>
              <div className="stat-label">Active users</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">
                {stats.totalHabits > 0 ? <CountUp end={stats.totalHabits} duration={2.5} separator="," /> : '...'}
              </div>
              <div className="stat-label">Habits tracked</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">
                {stats.totalCheckins > 0 ? <CountUp end={stats.totalCheckins} duration={2.5} separator="," /> : '...'}
              </div>
              <div className="stat-label">Check-ins completed</div>
            </div>
          </motion.div>

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
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon"><FiZap /></div>
              <h3>Streak Tracking</h3>
              <p>Watch your consistency grow with visual streak counters that motivate you daily.</p>
            </motion.div>
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon"><FiUsers /></div>
              <h3>Community Support</h3>
              <p>Join a supportive community of habit builders who celebrate your wins.</p>
            </motion.div>
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon"><FiTrendingUp /></div>
              <h3>Progress Analytics</h3>
              <p>Get detailed insights into your habit patterns with beautiful charts.</p>
            </motion.div>
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="feature-icon"><FiAward /></div>
              <h3>Achievements</h3>
              <p>Unlock badges and achievements as you hit milestones.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section">
        <motion.div
          className="final-cta-container"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="cta-content-new">
            <h2>Start building habits that last</h2>
            <p>Join {stats.totalUsers > 0 && <CountUp end={stats.totalUsers} duration={2} separator="," />}{stats.totalUsers > 0 && '+'} users who've already transformed their lives</p>
          </div>
          <div className="cta-actions-new">
            <Link to="/login" className="btn-primary-new">
              Get started free
              <FiArrowRight />
            </Link>
          </div>
          <div className="cta-fine-print">
            <span><FiCheck /> No credit card required</span>
            <span><FiCheck /> Free forever</span>
            <span><FiCheck /> Cancel anytime</span>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="footer-new">
        <div className="footer-container">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="brand-footer">Aadat<span className="neon-dot"></span></div>
            <p>Build habits that actually stick</p>
          </motion.div>
          <motion.div
            className="footer-links"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Support</a>
          </motion.div>
          <motion.div
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span>© 2025 Aadat. All rights reserved.</span>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
