import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { achievementsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../home.css';

const Profile = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
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

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await achievementsAPI.getAll();
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getAchievementIcon = (achievement) => {
    // Use icon from database if available, otherwise use default based on name
    if (achievement.icon) {
      return achievement.icon;
    }
    
    const iconMap = {
      'first_post': '✍️',
      'streak_3_day': '🔥',
      'streak_7_day': '🗓️',
      'level_5': '🚀',
    };
    return iconMap[achievement.name] || '🏆';
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <main className="main-container">
        <div className="content-wrapper-single">
          {/* Profile Header */}
          <section className="profile-header-section">
            <div className="profile-header-card">
              <div className="profile-avatar-large">
                <div className="avatar-circle-large">{getInitials()}</div>
              </div>
              <div className="profile-header-info">
                <h1 className="profile-username">{user?.username}</h1>
                <p className="profile-bio">Building habits in public.</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Longest Streak</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number">Level {user?.user_level || 1}</div>
                <div className="stat-label">Current Level</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number neon">{user?.user_xp || 0}</div>
                <div className="stat-label">Total XP</div>
              </div>
            </div>
          </section>

          {/* Achievements Section */}
          <section className="profile-achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid-profile">
              {achievements.length === 0 ? (
                <p>No achievements available yet.</p>
              ) : (
                achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-badge-profile ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon-large">
                      {getAchievementIcon(achievement)}
                    </div>
                    <div className="achievement-name">
                      {achievement.displayName || achievement.name}
                    </div>
                    <div className="achievement-description">
                      {achievement.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activity Feed */}
          <section className="profile-activity-section">
            <h2>My Journey</h2>
            <div className="activity-feed-container">
              <p className="empty-message">Your habit journey will appear here.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
