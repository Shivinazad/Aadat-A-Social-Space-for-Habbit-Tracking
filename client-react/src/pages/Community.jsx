import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import Navbar from '../components/Navbar';
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
          <section className="community-header">
            <div className="community-header-content">
              <div className="header-badge">
                <div className="live-dot"></div>
                <span>Live Feed</span>
              </div>
              <h1>Community Activity</h1>
              <p>See what others are building and share your progress</p>
            </div>
            <div className="community-stats">
              <div className="stat-box">
                <div className="stat-number">{stats.activeMembers}</div>
                <div className="stat-label">Active Members</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{stats.postsToday}</div>
                <div className="stat-label">Posts Today</div>
              </div>
              <div className="stat-box">
                <div className="stat-number neon">{stats.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
          </section>

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
                posts.map(post => {
                  const authorUsername = post.User?.username || 'Unknown User';
                  const authorAvatar = post.User?.avatar || '👤';
                  const habitTitle = post.Habit?.habitTitle || 'General Post';
                  const isLiked = post.isLikedByCurrentUser;

                  return (
                    <div key={post.id} className="post-card">
                      <div className="post-header">
                        <div className="post-author-info">
                          <div className="post-avatar">{authorAvatar}</div>
                          <div className="post-meta">
                            <div className="post-author-name">{authorUsername}</div>
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
                        <button 
                          className={`btn-like ${isLiked ? 'liked' : ''}`}
                          onClick={() => !isLiked && handleLike(post.id)}
                          disabled={isLiked}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path 
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              fill={isLiked ? 'currentColor' : 'none'}
                            />
                          </svg>
                          {isLiked ? 'Liked' : 'Like'}
                        </button>
                        <span className="post-stat">
                          ❤️ {post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}
                        </span>
                      </div>
                    </div>
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
