import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import '../home.css';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMembers: 0,
    postsToday: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getAll();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await postsAPI.getCommunityStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div>
      <Navbar />
      
      <main className="main-container">
        <div className="content-wrapper-single">
          {/* Header Section */}
          <motion.section 
            className="community-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="community-header-content">
              <motion.div 
                className="header-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="live-dot"></div>
                <span>Live Feed</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Community Activity
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                See what others are building and share your progress
              </motion.p>
            </div>
            <motion.div 
              className="community-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="stat-box">
                <div className="stat-number"><CountUp end={stats.activeMembers} duration={2} /></div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat-box">
                <div className="stat-number"><CountUp end={stats.postsToday} duration={2} /></div>
                <div className="stat-label">Posts Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-number neon"><CountUp end={stats.completionRate} duration={2} />%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </motion.div>
          </motion.section>

          {/* Feed Section */}
          <section className="feed-section">
            <div className="feed-container">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading community feed...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No posts yet</h3>
                  <p>Be the first to share your progress! Check in to a habit from your dashboard.</p>
                </div>
              ) : (
                posts.map((post, index) => {
                  const authorUsername = post.User?.username || 'Unknown User';
                  const authorAvatar = post.User?.avatar || '👤';
                  const habitTitle = post.Habit?.habitTitle || 'General Post';
                  const isLiked = post.isLikedByCurrentUser;

                  // Render avatar: show image if URL, emoji/text otherwise
                  const renderAvatar = (avatar) => {
                    if (!avatar) return '👤';
                    if (typeof avatar === 'string' && avatar.startsWith('http')) {
                      return (
                        <img
                          src={avatar}
                          alt={authorUsername || 'avatar'}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#222' }}
                        />
                      );
                    }
                    return avatar;
                  };

                  return (
                    <motion.div 
                      key={post.id} 
                      className="post-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <div className="post-header">
                        <div className="post-author-info">
                          <div className="post-avatar">{renderAvatar(authorAvatar)}</div>
                          <div className="post-meta">
                            <div className="post-author-name">
                              {post.User ? (
                                <Link to={`/profile/${post.User.id || post.User._id}`} className="author-link">{authorUsername}</Link>
                              ) : (
                                authorUsername
                              )}
                            </div>
                            <div className="post-date">{formatDate(post.createdAt)}</div>
                          </div>
                        </div>
                        <div className="post-habit-badge">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5z" fill="currentColor"/>
                          </svg>
                          {habitTitle}
                        </div>
                      </div>
                      <div className="post-content">
                        <p>{post.content}</p>
                      </div>
                      <div className="post-actions">
                        <motion.button 
                          className={`btn-like ${isLiked ? 'liked' : ''}`}
                          onClick={() => !isLiked && handleLike(post.id)}
                          disabled={isLiked}
                          whileHover={{ scale: isLiked ? 1 : 1.05 }}
                          whileTap={{ scale: isLiked ? 1 : 0.95 }}
                        >
                          <FiHeart fill={isLiked ? 'currentColor' : 'none'} />
                          {isLiked ? 'Liked' : 'Like'}
                        </motion.button>
                        <span className="post-stat">
                          <FiHeart /> {post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Community;
