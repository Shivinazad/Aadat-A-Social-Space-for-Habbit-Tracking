import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { habitsAPI, postsAPI, inviteAPI } from '../services/api';
import Navbar from '../components/Navbar';
import AddHabitModal from '../components/AddHabitModal';
import { Link } from 'react-router-dom';
import { celebrateCheckIn } from '../utils/confetti';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { FiPlus, FiCheck, FiX, FiEdit2, FiTrash2, FiMoreVertical, FiArrowRight, FiTrendingUp, FiAward, FiUsers, FiZap, FiMap } from 'react-icons/fi';
import '../home.css';


const Dashboard = () => {
  const { user, updateUser, fetchUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState({
    completedHabits: 0,
    totalCheckins: 0,
    successRate: 0
  });

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [checkinContent, setCheckinContent] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(null);
  const [showEditHabitModal, setShowEditHabitModal] = useState(false);
  const [editHabit, setEditHabit] = useState(null);

  // Ensure user is loaded after OAuth login
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    fetchHabits();
    fetchWeeklyStats();
  }, []);

  // Poll the authenticated user's profile periodically so UI (XP bar, level)
  // updates soon after server-side XP changes without requiring a full page reload.
  useEffect(() => {
    // Only poll when user is present (authenticated)
    if (!user?.id) return;

    const POLL_INTERVAL = 10000; // 10s
    const interval = setInterval(() => {
      fetchUser();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [user?.id, fetchUser]);

  const fetchHabits = async () => {
    try {
      const response = await habitsAPI.getAll();
      console.log('📋 Fetched habits:', response.data.map(h => ({ 
        id: h.id, 
        title: h.habitTitle, 
        hasRoadmap: !!h.roadmap,
        roadmapLength: h.roadmap ? (Array.isArray(h.roadmap) ? h.roadmap.length : 'not array') : 0
      })));
      setHabits(response.data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      if (!user?.id) {
        console.warn('User not loaded yet, skipping weekly stats fetch');
        return;
      }

      const response = await postsAPI.getAll();
      const posts = response.data;

      // Get posts from the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyPosts = posts.filter(post =>
        new Date(post.createdAt) >= oneWeekAgo &&
        post.userId === user.id
      );

      // Calculate unique habits completed this week
      const uniqueHabits = new Set(weeklyPosts.map(post => post.habitId));
      const totalHabits = habits.length;
      // If we don't yet know the user's habits, avoid reporting >100%.
      // When totalHabits is 0 (no habits), successRate should be 0.
      const successRate = totalHabits > 0 ? Math.min(100, Math.round((uniqueHabits.size / totalHabits) * 100)) : 0;

      setWeeklyStats({
        completedHabits: uniqueHabits.size,
        totalCheckins: weeklyPosts.length,
        successRate: isNaN(successRate) ? 0 : successRate
      });
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const openCheckinModal = (habit) => {
    setCurrentHabit(habit);
    setShowCheckinModal(true);
    setCheckinContent('');
  };

  const handleCheckin = async () => {
    if (!checkinContent.trim()) {
      showToast('Please write something', 'error');
      return;
    }

    try {
      await postsAPI.create({
        content: checkinContent,
        habitId: currentHabit.id,
      });
      setShowCheckinModal(false);
      celebrateCheckIn(); // Trigger celebration animation
      showToast('Check-in successful! 🎉');
      fetchHabits();
      fetchUser();
      fetchWeeklyStats();
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Failed to post check-in';
      showToast(errorMsg, 'error');
    }
  };

  const handleHabitSuccess = () => {
    showToast('Habit added successfully! 💪');
    fetchHabits();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    try {
      const response = await inviteAPI.sendInvite(inviteEmail);
      const data = response.data;
      setInviteEmail('');

      // Check if email was actually sent or if we got a fallback link
      if (data.inviteLink) {
        // Email service not available - copy link to clipboard
        try {
          await navigator.clipboard.writeText(data.inviteLink);
          showToast(`${data.message} (Link copied! 📋)`);
        } catch (clipboardError) {
          // Clipboard failed - show link in toast
          showToast(`${data.message}: ${data.inviteLink}`);
        }
      } else if (data.emailSent) {
        // Email successfully sent
        showToast(data.message || 'Invitation email sent successfully! 📧');
      } else {
        // Generic success
        showToast(data.message || 'Invitation processed! ✨');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.msg || 'Failed to send invitation';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      await habitsAPI.delete(habitId);
      // Remove roadmap progress from localStorage
      localStorage.removeItem(`roadmap_progress_${habitId}`);
      setSettingsMenuOpen(null);
      showToast('Habit deleted successfully');
      fetchHabits();
    } catch (error) {
      showToast('Failed to delete habit', 'error');
    }
  };

  const openEditModal = (habit) => {
    setEditHabit({ habitTitle: habit.habitTitle, habitCategory: habit.habitCategory || '', id: habit.id });
    setShowEditHabitModal(true);
    setSettingsMenuOpen(null);
  };

  const handleEditHabit = async (e) => {
    e.preventDefault();
    if (!editHabit.habitTitle.trim()) {
      showToast('Habit title is required', 'error');
      return;
    }

    try {
      await habitsAPI.update(editHabit.id, {
        habitTitle: editHabit.habitTitle,
        habitCategory: editHabit.habitCategory
      });
      setShowEditHabitModal(false);
      setEditHabit(null);
      showToast('Habit updated successfully! ✏️');
      fetchHabits();
    } catch (error) {
      showToast('Failed to update habit', 'error');
    }
  };

  const toggleSettingsMenu = (habitId) => {
    setSettingsMenuOpen(settingsMenuOpen === habitId ? null : habitId);
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setSettingsMenuOpen(null);
    if (settingsMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [settingsMenuOpen]);

  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0;

  // Calculate XP for next level dynamically
  const getXpForNextLevel = (level) => {
    if (level === 1) return 80;
    if (level === 2) return 200;
    if (level === 3) return 400;
    if (level === 4) return 800;
    if (level === 5) return 1600;
    if (level === 6) return 3200;
    if (level === 7) return 6400;
    if (level === 8) return 12800;
    if (level === 9) return 25600;
    return 51200 * (level - 9);
  };

  const currentLevel = user?.user_level || 1;
  const xpForNextLevel = getXpForNextLevel(currentLevel);
  const xpPercentage = user ? ((user.user_xp % xpForNextLevel) / xpForNextLevel) * 100 : 0;
  // Avatar rendering: show image if URL, emoji/text otherwise
  const getAvatarElement = () => {
    if (!user?.avatar) return '👤';
    if (typeof user.avatar === 'string' && user.avatar.startsWith('http')) {
      return (
        <img
          src={user.avatar}
          alt={user.username || 'avatar'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#222' }}
        />
      );
    }
    return user.avatar;
  };


  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main className="main-container">
        <div className="content-wrapper">
          {/* Left Column - Main Content */}
          <div className="main-column">
            {/* Welcome Section */}
            <motion.section
              className="welcome-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="welcome-content">
                <motion.div
                  className="welcome-badge"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="live-dot"></div>
                  <span>Welcome back</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="continue-journey-title"
                >
                  Continue your journey
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Track your progress, build consistency, and achieve your goals one habit at a time.
                </motion.p>
              </div>
              <motion.div
                className="welcome-visual"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="streak-card">
                  <div className="streak-icon">🔥</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                    <div className="streak-number" style={{ lineHeight: 1, marginBottom: 0 }}>
                      <CountUp end={maxStreak} duration={1.5} />
                    </div>
                    <div className="streak-label" style={{ marginTop: 0 }}>DAY STREAK</div>
                  </div>
                </div>
              </motion.div>

            </motion.section>

            {/* Today's Habits */}
            <section className="habits-section">
              <div className="section-header" style={{ 
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '900', 
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.02em',
                    color: 'var(--white)'
                  }}>
                    Today's Habits
                  </h2>
                  <p className="section-subtitle" style={{ 
                    color: 'var(--gray-400)', 
                    fontSize: '0.95rem',
                    fontWeight: '400'
                  }}>
                    {habits.length === 0 ? 'Start tracking your daily habits' : 'Keep your momentum going'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setShowAddHabitModal(true)}
                  className="btn-add"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus />
                  Add Habit
                </motion.button>
              </div>

              <div className="habit-list">
                {habits.length === 0 ? (
                  <motion.div
                    className="empty-state-habits"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4rem 2rem',
                      textAlign: 'center',
                      minHeight: '300px'
                    }}
                  >
                    <div style={{ 
                      fontSize: '64px', 
                      marginBottom: '1.5rem',
                      opacity: 0.6,
                      lineHeight: 1
                    }}>
                      ✨
                    </div>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75rem',
                      color: 'var(--white)'
                    }}>
                      No habits yet
                    </h3>
                    <p style={{ 
                      color: 'var(--gray-400)', 
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      maxWidth: '420px',
                      margin: '0 auto'
                    }}>
                      Ready to start your journey? Click the <strong style={{ color: 'var(--neon)' }}>Add Habit</strong> button above to create your first habit and begin building consistency.
                    </p>
                  </motion.div>
                ) : (
                  habits.map((habit, index) => {
                    const lastCheckin = habit.lastCheckinDate ? new Date(habit.lastCheckinDate) : null;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const lastCheckinDate = lastCheckin ? new Date(lastCheckin) : null;
                    if (lastCheckinDate) lastCheckinDate.setHours(0, 0, 0, 0);

                    const isCheckedInToday = lastCheckinDate && lastCheckinDate.getTime() === today.getTime();
                    const daysSinceLastCheckin = lastCheckin ? Math.floor((Date.now() - lastCheckin) / (1000 * 60 * 60 * 24)) : null;

                    return (
                      <motion.div
                        key={habit.id}
                        className="habit-item"
                        style={{ zIndex: settingsMenuOpen === habit.id ? 50 : 1, position: 'relative' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      >
                        <div className="habit-main-info">
                          <div className="habit-title-row">
                            <span className="habit-title">{habit.habitTitle}</span>
                            {habit.habitCategory && (
                              <span className="habit-category-badge">{habit.habitCategory}</span>
                            )}
                          </div>
                          {lastCheckin && (
                            <span className="last-checkin-text">
                              {isCheckedInToday ? '✅ Checked in today' :
                                daysSinceLastCheckin === 1 ? '📅 Last check-in: Yesterday' :
                                  `📅 Last check-in: ${daysSinceLastCheckin} days ago`}
                            </span>
                          )}
                        </div>
                        <span className="streak-count">🔥 {habit.currentStreak} days</span>
                        {habit.roadmap && habit.roadmap.length > 0 && (
                          <Link 
                            to={`/roadmap/${habit.id}`} 
                            className="btn btn-secondary btn-roadmap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiMap /> Roadmap
                          </Link>
                        )}
                        <button
                          className={`btn btn-primary btn-checkin ${isCheckedInToday ? 'checked-in' : ''}`}
                          onClick={() => openCheckinModal(habit)}
                          disabled={isCheckedInToday}
                        >
                          {isCheckedInToday ? '✓ Done' : 'Check In'}
                        </button>
                        <div className="habit-settings" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="settings-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSettingsMenu(habit.id);
                            }}
                          >
                            <FiMoreVertical />
                          </button>
                          <AnimatePresence>
                            {settingsMenuOpen === habit.id && (
                              <motion.div
                                className="settings-menu"
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <button
                                  className="settings-menu-item"
                                  onClick={() => openEditModal(habit)}
                                >
                                  <FiEdit2 />
                                  Edit Habit
                                </button>
                                <button
                                  className="settings-menu-item delete"
                                  onClick={() => handleDeleteHabit(habit.id)}
                                >
                                  <FiTrash2 />
                                  Delete Habit
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <motion.a
                  href="/community"
                  className="action-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="action-icon"><FiUsers /></div>
                  <div className="action-content">
                    <h3>Join Community</h3>
                    <p>Connect with others building similar habits</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </motion.a>

                <motion.a
                  href="/leaderboard"
                  className="action-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="action-icon"><FiAward /></div>
                  <div className="action-content">
                    <h3>View Leaderboard</h3>
                    <p>See how you rank against other members</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </motion.a>

                <motion.div
                  className="action-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="action-icon"><FiZap /></div>
                  <div className="action-content">
                    <h3>30-Day Challenge</h3>
                    <p>Commit to building consistency for 30 days</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </motion.div>

                <motion.div
                  className="action-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <div className="action-icon"><FiTrendingUp /></div>
                  <div className="action-content">
                    <h3>View Analytics</h3>
                    <p>Track your progress with detailed insights</p>
                  </div>
                  <FiArrowRight className="action-arrow" />
                </motion.div>
              </div>
            </section>

            {/* Invite Section */}
            <section className="invite-section">
              <div className="invite-content">
                <div className="invite-icon">💌</div>
                <div className="invite-text">
                  <h3>Invite Friends</h3>
                  <p>Help your friends build better habits. Share Aadat with them.</p>
                </div>
              </div>
              <div className="invite-form">
                <input
                  type="email"
                  placeholder="friend@example.com"
                  className="invite-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                />
                <button onClick={handleInvite} className="btn-invite">Send Invite</button>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="sidebar">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-header">
                <div className="avatar-circle">{getAvatarElement()}</div>
                <div className="profile-info">
                  <h3 className="profile-name">{user?.username}</h3>
                  <Link to={`/profile/${user?.id}`} className="view-profile-link">View profile →</Link>
                </div>
              </div>

              <div className="level-section">
                <div className="level-header">
                  <span className="level-text">Level {user?.user_level}</span>
                  <span className="xp-count">{user?.user_xp} / {xpForNextLevel} XP</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${xpPercentage}%` }}></div>
                </div>
              </div>

              <div className="achievements-grid">
                <div className="achievement-item locked">
                  <span className="achievement-icon">🥉</span>
                </div>
                <div className="achievement-item unlocked">
                  <span className="achievement-icon">🔥</span>
                </div>
                <div className="achievement-item locked">
                  <span className="achievement-icon">⭐</span>
                </div>
                <div className="achievement-item locked">
                  <span className="achievement-icon">🏆</span>
                </div>
              </div>
            </div>

            {/* Consistency Plant */}
            <div className="plant-card">
              <div className="plant-visual">
                <div className="plant-emoji">🌱</div>
              </div>
              <div className="plant-content">
                <h4>Your Growth</h4>
                <p>Maintained a <strong>{maxStreak}-day</strong> streak! Keep nurturing your habits.</p>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              className="stats-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4>This Week's Progress</h4>
              <div className="stat-row">
                <span className="stat-label">Habits worked on</span>
                <span className="stat-value"><CountUp end={weeklyStats.completedHabits} duration={1.5} /></span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total check-ins</span>
                <span className="stat-value"><CountUp end={weeklyStats.totalCheckins} duration={1.5} /></span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Consistency rate</span>
                <span className="stat-value neon"><CountUp end={weeklyStats.successRate} duration={1.5} />%</span>
              </div>
            </motion.div>
          </aside>
        </div >
      </main >

      {/* Check-in Modal */}
      {
        showCheckinModal && (
          <div className="modal-overlay open" onClick={() => setShowCheckinModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Check-in: {currentHabit?.habitTitle}</h2>
                <button onClick={() => setShowCheckinModal(false)} className="modal-close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="modal-body">
                <label htmlFor="modal-textarea">What did you accomplish today?</label>
                <textarea
                  id="modal-textarea"
                  placeholder="Share your progress..."
                  value={checkinContent}
                  onChange={(e) => setCheckinContent(e.target.value)}
                  maxLength={280}
                />
                <div className="char-counter-wrapper">
                  <span className="char-counter">{280 - checkinContent.length}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowCheckinModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCheckin} className="btn-primary">Post Check-in</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={showAddHabitModal} 
        onClose={() => setShowAddHabitModal(false)}
        onSuccess={handleHabitSuccess}
      />

      {/* Edit Habit Modal */}
      {
        showEditHabitModal && editHabit && (
          <div className="modal-overlay open" onClick={() => setShowEditHabitModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Habit</h2>
                <button onClick={() => setShowEditHabitModal(false)} className="modal-close">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditHabit}>
                <div className="modal-body">
                  <div className="input-group">
                    <label htmlFor="edit-habit-title-input">Habit Title</label>
                    <input
                      type="text"
                      id="edit-habit-title-input"
                      placeholder="e.g., Morning workout"
                      value={editHabit.habitTitle}
                      onChange={(e) => setEditHabit({ ...editHabit, habitTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="edit-habit-category-input">Category <span className="optional">(Optional)</span></label>
                    <input
                      type="text"
                      id="edit-habit-category-input"
                      placeholder="e.g., Fitness, Learning"
                      value={editHabit.habitCategory}
                      onChange={(e) => setEditHabit({ ...editHabit, habitCategory: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowEditHabitModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Update Habit</button>
                </div>
              </form>
            </div>
          </div>
        )
      }
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

      {/* Toast Notification */}
      {
        toast.show && (
          <div className={`toast-notification show ${toast.type === 'error' ? 'toast-error' : ''}`}>
            {toast.message}
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;
