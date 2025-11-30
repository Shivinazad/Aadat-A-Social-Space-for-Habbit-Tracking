import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { achievementsAPI, postsAPI, authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../home.css';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const viewingUserId = params.id;
  const isOwnProfile = !viewingUserId || String(viewingUserId) === String(user?.id);
  const [achievements, setAchievements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    totalHabits: 0,
    totalCheckins: 0
  });

  const avatarOptions = ['👤', '😀', '😎', '🤓', '🥳', '🤠', '🧑‍💻', '🧑‍🎨', '🧑‍🚀', '🧑‍🔬', '🦸', '🧙', '🧚', '🧛', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄', '🐧', '🦉', '🦋', '🌟', '⚡', '🔥', '💎'];

  useEffect(() => {
    // Decide which user's data to load: current user or a public user by id
    const targetId = viewingUserId || user?.id;
    if (viewingUserId) {
      fetchViewedUser(viewingUserId);
    } else {
      setViewedUser(null);
    }
    if (targetId) {
      fetchAchievements(targetId);
      fetchPosts(targetId);
      fetchStats(targetId);
    }
  }, [user, viewingUserId]);

  const fetchViewedUser = async (id) => {
    try {
      const res = await authAPI.getUserById(id);
      setViewedUser(res.data);
    } catch (err) {
      console.error('Failed to fetch viewed user:', err);
      setViewedUser(null);
    }
  };

  const fetchStats = async (targetId) => {
    try {
      if (!isOwnProfile && viewingUserId) {
        // viewing another user's profile
        try {
          const response = await authAPI.getUserStats(viewingUserId);
          setStats(response.data);
        } catch (err) {
          console.warn('Failed to fetch viewed user stats:', err);
          setStats((s) => s);
        }
      } else {
        const response = await authAPI.getUserStats();
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const fetchAchievements = async (targetId) => {
    try {
      // Get all achievements
      const allAchievementsResponse = await achievementsAPI.getAll();
      const allAchievements = allAchievementsResponse.data;
      
      // Get user's unlocked achievements (use public endpoint when viewing another user)
      let userAchievementsResponse;
      if (targetId && viewingUserId) {
        try {
          userAchievementsResponse = await authAPI.getUserAchievements(targetId);
        } catch (err) {
          userAchievementsResponse = { data: [] };
        }
      } else {
        userAchievementsResponse = await authAPI.getAchievements();
      }
      const userAchList = userAchievementsResponse.data || [];
      // Debug: log the returned unlocked achievements for inspection
      console.log('User achievements response for', targetId, userAchList);
      // Build lookup by id, name and displayName to be robust against different shapes
      const unlockedIds = new Set(userAchList.map(a => String(a.id)));
      const unlockedNames = new Set(userAchList.map(a => a.name));
      const unlockedDisplayNames = new Set(userAchList.map(a => a.displayName));
      // If the API returned UserAchievement records, they may reference the achievement via `achievementId`
      const unlockedByRefId = new Set(userAchList.map(a => a.achievementId ? String(a.achievementId) : null));

      // Mark which achievements are unlocked (match by id or name)
      const achievementsWithStatus = allAchievements.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(String(achievement.id)) || unlockedNames.has(achievement.name) || unlockedDisplayNames.has(achievement.displayName) || unlockedByRefId.has(String(achievement.id))
      }));
      
      setAchievements(achievementsWithStatus);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const targetId = viewingUserId || user.id;
      console.log('Fetching posts for user:', targetId);
      const response = await postsAPI.getUserPosts(targetId);
      console.log('Posts API response:', response);
      console.log('Posts received:', response.data);
      console.log('Number of posts:', response.data?.length || 0);
      
        if (response.data && Array.isArray(response.data)) {
        // Sort posts by creation date (newest first)
        const sortedPosts = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log('Sorted posts:', sortedPosts);
        setPosts(sortedPosts);
        // If we're viewing another user's profile but `viewedUser` wasn't set (server fetch may have failed),
        // use the author info attached to posts as a reliable fallback
        if (viewingUserId && (!viewedUser || !viewedUser.id) && sortedPosts.length > 0 && sortedPosts[0].User) {
          setViewedUser(sortedPosts[0].User);
        }
      } else {
        console.warn('Response data is not an array:', response.data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      console.error('Error details:', error.response?.data || error.message);
      setPosts([]);
    }
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.like(postId);
      // Update the post in the local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLikedByCurrentUser: true,
              likeCount: (post.likeCount || 0) + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Render avatar: prefer viewed user's avatar when viewing someone else
  const getAvatarElement = (overrideUser) => {
    const targetUser = overrideUser || (isOwnProfile ? user : viewedUser);
    const avatar = targetUser?.avatar;
    if (!avatar) return '👤';
    if (typeof avatar === 'string' && avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={targetUser?.username || 'avatar'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#222' }}
        />
      );
    }
    return avatar;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveAvatar = async () => {
    try {
      const response = await authAPI.updateProfile({ avatar: selectedAvatar });
      updateUser(response.data);
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert('Failed to update avatar');
    }
  };

  const handleSaveBio = async () => {
    try {
      const response = await authAPI.updateProfile({ bio });
      updateUser(response.data);
      setShowBioModal(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert('Failed to update bio');
    }
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
                <div className="avatar-circle-large">{getAvatarElement()}</div>
              </div>
                <div className="profile-header-info">
                <h1 className="profile-username">{isOwnProfile ? (user?.username) : (viewedUser?.username || 'User')}</h1>
                <p className="profile-bio">{isOwnProfile ? (user?.bio || 'Building habits in public.') : (viewedUser?.bio || 'Building habits in public.')}</p>
              </div>
              {isOwnProfile && (
                <div className="profile-settings-container">
                  <button 
                    className="settings-btn" 
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                      <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                      <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                    </svg>
                  </button>
                  {showSettings && (
                    <div className="settings-dropdown">
                      <button 
                        className="settings-item" 
                        onClick={() => {
                          setShowSettings(false);
                          navigate('/profile/edit');
                        }}
                      >
                        <span>✏️</span> Edit Profile
                      </button>
                      <button 
                        className="settings-item danger" 
                        onClick={handleLogout}
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="stat-number">🔥 {stats.currentStreak}</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number">⭐ {stats.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number">Level {isOwnProfile ? (user?.user_level || 1) : (viewedUser?.user_level || 1)}</div>
                <div className="stat-label">Current Level</div>
              </div>
              <div className="profile-stat-card">
                <div className="stat-number neon">{isOwnProfile ? (user?.user_xp || 0) : (viewedUser?.user_xp || 0)}</div>
                <div className="stat-label">Total XP</div>
              </div>
              {/* Weekly completion and check-ins removed per request */}
            </div>
          </section>

          {/* Achievements Section */}
          <section className="profile-achievements-section">
            <div className="achievements-header">
              <h2>Achievements</h2>
              <span className="achievements-count">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
              </span>
            </div>
            <div className="achievements-scroll-container">
              {achievements.length === 0 ? (
                <p>No achievements available yet.</p>
              ) : (
                achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-badge-scroll ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                    title={achievement.unlocked ? `Unlocked!` : `Keep going to unlock this!`}
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
                    {achievement.unlocked && (
                      <div className="unlocked-badge">✓ Unlocked</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Activity Feed */}
          <section className="profile-activity-section">
            <h2>My Journey</h2>
            <div className="activity-feed-container">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-message">
                    Your habit check-ins will appear here. 
                  </p>
                  <p className="empty-message-hint">
                    💡 Go to Dashboard → Check in on a habit to create your first post!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-author-info">
                        <div className="post-avatar">{getAvatarElement(post.User || viewedUser)}</div>
                        <div className="post-meta">
                          <div className="post-author-name">{post.User?.username || viewedUser?.username || user?.username}</div>
                          <div className="post-date">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      {post.Habit && (
                        <div className="post-habit-badge">
                          🎯 {post.Habit.habitTitle}
                        </div>
                      )}
                    </div>
                    {post.content && (
                      <div className="post-content">
                        <p>{post.content}</p>
                      </div>
                    )}
                    <div className="post-actions">
                      <button 
                        className={`btn-like ${post.isLikedByCurrentUser ? 'liked' : ''}`}
                        onClick={() => !post.isLikedByCurrentUser && handleLike(post.id)}
                        disabled={post.isLikedByCurrentUser}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path 
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            fill={post.isLikedByCurrentUser ? 'currentColor' : 'none'}
                          />
                        </svg>
                        {post.isLikedByCurrentUser ? 'Liked' : 'Like'}
                      </button>
                      <span className="post-stat">
                        ❤️ {post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>


    </div>
  );
};

export default Profile;
