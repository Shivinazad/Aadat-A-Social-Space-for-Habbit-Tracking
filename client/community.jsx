import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // 1. AUTH GUARD
  // -------------------------------
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // -------------------------------
  // 2. FETCH CURRENT USER (Avatar)
  // -------------------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    }

    fetchUser();
  }, [token]);

  // -------------------------------
  // 3. FETCH FEED POSTS
  // -------------------------------
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("http://localhost:3000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Could not fetch feed");

        const posts = await res.json();
        setFeedPosts(posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [token]);

  // -------------------------------
  // 4. LIKE POST
  // -------------------------------
  async function likePost(postId) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to like post");

      // Update UI: mark post as liked
      setFeedPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, isLikedByCurrentUser: true } : post
        )
      );

      // Trigger notifications refresh (if exists)
      if (window.refreshNotifications) window.refreshNotifications();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // -------------------------------
  // 5. RENDER FEED POSTS
  // -------------------------------
  const renderFeed = () => {
    if (loading) {
      return (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Loading posts...</h3>
        </div>
      );
    }

    if (!feedPosts.length) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Be the first to share your progress!</p>
        </div>
      );
    }

    return feedPosts.map((post) => {
      const date = new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const author = post.User?.username || "Unknown User";
      const initials = author.substring(0, 2).toUpperCase();
      const habit = post.Habit?.habitTitle || "General Post";

      const liked = post.isLikedByCurrentUser;

      return (
        <div key={post.id} className="post-card">
          {/* Header */}
          <div className="post-header">
            <div className="post-author-info">
              <div className="post-avatar">{initials}</div>
              <div className="post-meta">
                <div className="post-author-name">{author}</div>
                <div className="post-date">{date}</div>
              </div>
            </div>

            <div className="post-habit-badge">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5z"
                  fill="currentColor"
                />
              </svg>
              {habit}
            </div>
          </div>

          {/* Content */}
          <div className="post-content">
            <p>{post.content}</p>
          </div>

          {/* Actions */}
          <div className="post-actions">
            <button
              className={`btn-like ${liked ? "liked" : ""}`}
              disabled={liked}
              onClick={() => likePost(post.id)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill={liked ? "currentColor" : "none"}
                />
              </svg>
              {liked ? "Liked" : "Like"}
            </button>
          </div>
        </div>
      );
    });
  };

  // -------------------------------
  // 6. MAIN JSX
  // -------------------------------
  return (
    <div className="community-page">
      {/* Top Bar Avatar */}
      <div className="header-avatar">
        <div className="user-avatar">
          {user?.username?.substring(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Feed */}
      <div id="feed-posts-container">{renderFeed()}</div>
    </div>
  );
}
