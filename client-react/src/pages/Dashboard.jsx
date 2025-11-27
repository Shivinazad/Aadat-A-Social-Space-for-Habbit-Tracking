import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { habitsAPI, postsAPI, inviteAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../home.css';

const Dashboard = () => {
  const { user, updateUser, fetchUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    document.body.classList.remove('light-mode');
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, []);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [currentHabit, setCurrentHabit] = useState(null);
  const [checkinContent, setCheckinContent] = useState('');
  const [newHabit, setNewHabit] = useState({ habitTitle: '', habitCategory: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await habitsAPI.getAll();
      setHabits(response.data);
    } catch (error) {
      console.error('Failed to fetch habits:', error);
    } finally {
      setLoading(false);
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
      showToast('Check-in successful! 🎉');
      fetchHabits();
      fetchUser();
    } catch (error) {
      showToast('Failed to post check-in', 'error');
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.habitTitle.trim()) {
      showToast('Habit title is required', 'error');
      return;
    }

    try {
      console.log('Creating habit:', newHabit);
      const response = await habitsAPI.create(newHabit);
      console.log('Habit created:', response.data);
      setShowAddHabitModal(false);
      setNewHabit({ habitTitle: '', habitCategory: '' });
      showToast('Habit added successfully! 💪');
      await fetchHabits(); // Wait for habits to reload
    } catch (error) {
      console.error('Failed to create habit:', error);
      showToast('Failed to create habit', 'error');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    try {
      await inviteAPI.sendInvite(inviteEmail);
      setInviteEmail('');
      showToast('Invitation sent successfully! 📧');
    } catch (error) {
      showToast(error.response?.data?.msg || 'Failed to send invitation', 'error');
    }
  };

  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0;
  const xpPercentage = user ? (user.user_xp / 500) * 100 : 0;
  const initials = user?.username?.substring(0, 2).toUpperCase() || 'U';

  if (loading) {
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
            <section className="welcome-section">
              <div className="welcome-content">
                <div className="welcome-badge">
                  <div className="live-dot"></div>
                  <span>Welcome back</span>
                </div>
                <h1>Continue your journey</h1>
                <p>Track your progress, build consistency, and achieve your goals one habit at a time.</p>
              </div>
              <div className="welcome-visual">
                <div className="streak-display">
                  <div className="streak-icon">🔥</div>
                  <div className="streak-info">
                    <div className="streak-number">{maxStreak}</div>
                    <div className="streak-label">Day Streak</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Today's Habits */}
            <section className="habits-section">
              <div className="section-header">
                <div>
                  <h2>Today's Habits</h2>
                  <p className="section-subtitle">Keep your momentum going</p>
                </div>
                <button onClick={() => setShowAddHabitModal(true)} className="btn-add">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Habit
                </button>
              </div>
              
              <div className="habit-list">
                {habits.length === 0 ? (
                  <p>You haven't added any habits yet. Add one to get started!</p>
                ) : (
                  habits.map(habit => (
                    <div key={habit.id} className="habit-item">
                      <span>{habit.habitTitle}</span>
                      <span className="streak-count">🔥 {habit.currentStreak} days</span>
                      <button 
                        className="btn btn-primary btn-checkin"
                        onClick={() => openCheckinModal(habit)}
                      >
                        Check In
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <a href="/community" className="action-card">
                  <div className="action-icon">💬</div>
                  <div className="action-content">
                    <h3>Join Community</h3>
                    <p>Connect with others building similar habits</p>
                  </div>
                  <svg className="action-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>

                <a href="/leaderboard" className="action-card">
                  <div className="action-icon">🏆</div>
                  <div className="action-content">
                    <h3>View Leaderboard</h3>
                    <p>See how you rank against other members</p>
                  </div>
                  <svg className="action-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </a>

                <div className="action-card">
                  <div className="action-icon">⚡</div>
                  <div className="action-content">
                    <h3>30-Day Challenge</h3>
                    <p>Commit to building consistency for 30 days</p>
                  </div>
                  <svg className="action-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>

                <div className="action-card">
                  <div className="action-icon">📊</div>
                  <div className="action-content">
                    <h3>View Analytics</h3>
                    <p>Track your progress with detailed insights</p>
                  </div>
                  <svg className="action-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
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
                <div className="avatar-circle">{initials}</div>
                <div className="profile-info">
                  <h3 className="profile-name">{user?.username}</h3>
                  <a href="/profile" className="view-profile-link">View profile →</a>
                </div>
              </div>
              
              <div className="level-section">
                <div className="level-header">
                  <span className="level-text">Level {user?.user_level}</span>
                  <span className="xp-count">{user?.user_xp} / 500 XP</span>
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
            <div className="stats-card">
              <h4>This Week</h4>
              <div className="stat-row">
                <span className="stat-label">Habits completed</span>
                <span className="stat-value">12</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Check-ins</span>
                <span className="stat-value">18</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Success rate</span>
                <span className="stat-value neon">86%</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="modal-overlay open" onClick={() => setShowCheckinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Check-in: {currentHabit?.habitTitle}</h2>
              <button onClick={() => setShowCheckinModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
      )}

      {/* Add Habit Modal */}
      {showAddHabitModal && (
        <div className="modal-overlay open" onClick={() => setShowAddHabitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Habit</h2>
              <button onClick={() => setShowAddHabitModal(false)} className="modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddHabit}>
              <div className="modal-body">
                <div className="input-group">
                  <label htmlFor="habit-title-input">Habit Title</label>
                  <input 
                    type="text" 
                    id="habit-title-input"
                    placeholder="e.g., Morning workout" 
                    value={newHabit.habitTitle}
                    onChange={(e) => setNewHabit({ ...newHabit, habitTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="habit-category-input">Category <span className="optional">(Optional)</span></label>
                  <input 
                    type="text" 
                    id="habit-category-input"
                    placeholder="e.g., Fitness, Learning"
                    value={newHabit.habitCategory}
                    onChange={(e) => setNewHabit({ ...newHabit, habitCategory: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddHabitModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification show ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
