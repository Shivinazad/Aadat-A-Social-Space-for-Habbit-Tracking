import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../home.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
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

  const getInitials = (username) => {
    return username?.substring(0, 2).toUpperCase() || '--';
  };

  return (
    <div>
      <Navbar />
      
      <main className="main-container">
        <div className="content-wrapper-single">
          {/* Header Section */}
          <section className="leaderboard-header">
            <div className="header-content">
              <div className="header-badge">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 1l2.5 5 5.5.5-4 4 1 5.5L10 13l-5 3 1-5.5-4-4 5.5-.5z" fill="currentColor"/>
                </svg>
                <span>Rankings</span>
              </div>
              <h1>Top Habit Builders</h1>
              <p>See who's leading the way in building consistent habits</p>
            </div>
          </section>

          {/* Podium Section */}
          {!loading && leaderboard.length >= 3 && (
            <section className="podium-section">
              <div className="podium-container">
                {/* 2nd Place */}
                <div className="podium-card second">
                  <div className="podium-rank">
                    <div className="rank-number">2</div>
                  </div>
                  <div className="podium-avatar">{getInitials(getPodiumUser(2)?.username)}</div>
                  <div className="podium-info">
                    <div className="podium-name">{getPodiumUser(2)?.username || 'Loading...'}</div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(2)?.user_level || '-'}</strong></span>
                      <span className="podium-xp">{getPodiumUser(2)?.user_xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-card first">
                  <div className="podium-rank winner">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3 6 6.5.75-4.75 4.5 1.25 6.75L12 17l-6 3.75 1.25-6.75L2.5 9.75 9 9z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="podium-avatar">{getInitials(getPodiumUser(1)?.username)}</div>
                  <div className="podium-info">
                    <div className="podium-name">{getPodiumUser(1)?.username || 'Loading...'}</div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(1)?.user_level || '-'}</strong></span>
                      <span className="podium-xp">{getPodiumUser(1)?.user_xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-card third">
                  <div className="podium-rank">
                    <div className="rank-number">3</div>
                  </div>
                  <div className="podium-avatar">{getInitials(getPodiumUser(3)?.username)}</div>
                  <div className="podium-info">
                    <div className="podium-name">{getPodiumUser(3)?.username || 'Loading...'}</div>
                    <div className="podium-stats">
                      <span>Level <strong>{getPodiumUser(3)?.user_level || '-'}</strong></span>
                      <span className="podium-xp">{getPodiumUser(3)?.user_xp || 0} XP</span>
                    </div>
                  </div>
                </div>
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
                      <tr key={user.id}>
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
                            <div className="user-avatar-small">{getInitials(user.username)}</div>
                            <span>{user.username}</span>
                          </div>
                        </td>
                        <td>
                          <span className="level-badge">Level {user.user_level}</span>
                        </td>
                        <td>
                          <span className="xp-text">{user.user_xp} XP</span>
                        </td>
                      </tr>
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
