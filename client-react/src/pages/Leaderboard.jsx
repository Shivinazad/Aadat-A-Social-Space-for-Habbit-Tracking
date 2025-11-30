import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import '../home.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getTop();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPodiumUser = (rank) => {
    return leaderboard[rank - 1] || null;
  };

  // Avatar rendering: show image if URL, emoji/text otherwise
  const getAvatar = (user) => {
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

  return (
    <div>
      <Navbar />
      
      <main className="main-container">
        <div className="content-wrapper-single">
          {/* Header Section */}
          <motion.section 
            className="leaderboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="header-content">
              <motion.div 
                className="header-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <FiAward />
                <span>Rankings</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Top Habit Builders
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                See who's leading the way in building consistent habits
              </motion.p>
            </div>
          </motion.section>

          {/* Podium Section */}
          {!loading && leaderboard.length >= 3 && (
            <section className="podium-section">
              <div className="podium-container">
                {/* 2nd Place */}
                <motion.div 
                  className="podium-card second"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="podium-rank">
                    <div className="rank-number">2</div>
                  </div>
                  <div className="podium-avatar">{getAvatar(getPodiumUser(2))}</div>
                    <div className="podium-info">
                    <div className="podium-name">
                      {getPodiumUser(2) ? (
                        <Link to={`/profile/${getPodiumUser(2).id || getPodiumUser(2)._id}`} className="author-link">{getPodiumUser(2).username}</Link>
                      ) : 'Loading...'}
                    </div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(2)?.user_level || '-'}</strong></span>
                      <span className="podium-xp"><CountUp end={getPodiumUser(2)?.user_xp || 0} duration={2} /> XP</span>
                    </div>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div 
                  className="podium-card first"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="podium-rank winner">
                    <FiAward />
                  </div>
                  <div className="podium-avatar">{getAvatar(getPodiumUser(1))}</div>
                  <div className="podium-info">
                    <div className="podium-name">
                      {getPodiumUser(1) ? (
                        <Link to={`/profile/${getPodiumUser(1).id || getPodiumUser(1)._id}`} className="author-link">{getPodiumUser(1).username}</Link>
                      ) : 'Loading...'}
                    </div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(1)?.user_level || '-'}</strong></span>
                      <span className="podium-xp"><CountUp end={getPodiumUser(1)?.user_xp || 0} duration={2} /> XP</span>
                    </div>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div 
                  className="podium-card third"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="podium-rank">
                    <div className="rank-number">3</div>
                  </div>
                  <div className="podium-avatar">{getAvatar(getPodiumUser(3))}</div>
                  <div className="podium-info">
                    <div className="podium-name">
                      {getPodiumUser(3) ? (
                        <Link to={`/profile/${getPodiumUser(3).id || getPodiumUser(3)._id}`} className="author-link">{getPodiumUser(3).username}</Link>
                      ) : 'Loading...'}
                    </div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(3)?.user_level || '-'}</strong></span>
                      <span className="podium-xp"><CountUp end={getPodiumUser(3)?.user_xp || 0} duration={2} /> XP</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* Leaderboard Table */}
          <section className="leaderboard-table-section">
            <div className="table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Level</th>
                    <th>XP</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4">
                        <div className="loading-state">
                          <div className="loading-spinner"></div>
                          <span>Loading leaderboard...</span>
                        </div>
                      </td>
                    </tr>
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">
                          <p>No leaderboard data available</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((user, index) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 + (index * 0.05) }}
                      >
                        <td>
                          <div className="rank-cell">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                            {index > 2 && `#${index + 1}`}
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">{getAvatar(user)}</div>
                            <span>{user ? (
                              <Link to={`/profile/${user.id || user._id}`} className="author-link">{user.username}</Link>
                            ) : '-'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="level-badge">Level {user.user_level}</span>
                        </td>
                        <td>
                          <span className="xp-text"><CountUp end={user.user_xp} duration={1.5} delay={0.8 + (index * 0.05)} /> XP</span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
