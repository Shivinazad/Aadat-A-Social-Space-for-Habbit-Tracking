import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [posts, setPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // ------------------------
  // 1. AUTH GUARD
  // ------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ------------------------
  // 2. LOAD PROFILE DATA
  // ------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        // Fetch profile
        const profileRes = await fetch("http://localhost:3000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Profile fetch failed");
        const userData = await profileRes.json();
        setUser(userData);

        // Fetch habits
        const habitsRes = await fetch("http://localhost:3000/api/habits", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const habitsData = habitsRes.ok ? await habitsRes.json() : [];
        setHabits(habitsData);

        // Fetch posts
        const postsRes = await fetch("http://localhost:3000/api/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          const filteredPosts = allPosts.filter(
            (p) => p.userId === userData.id
          );
          setPosts(filteredPosts);
        }

        // Fetch achievements
        const achRes = await fetch(
          "http://localhost:3000/api/users/me/achievements",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (achRes.ok) {
          const achData = await achRes.json();
          setAchievements(achData);
        }

      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }

    loadProfile();
  }, [token, navigate]);

  // ------------------------
  // 3. RENDER HELPERS
  // ------------------------

  const renderStats = () => {
    let longest = 0;
    let current = 0;

    habits.forEach((h) => {
      if (h.longestStreak > longest) longest = h.longestStreak;
      if (h.currentStreak > current) current = h.currentStreak;
    });

    return (
      <>
        <div className="stat-number">{current}</div>
        <div className="stat-number">{longest}</div>
        <div className="stat-number">Level {user?.user_level || 1}</div>
        <div className="stat-number">{user?.user_xp || 0}</div>
      </>
    );
  };

  const renderActivityFeed = () => {
    if (!posts.length)
      return (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No activity recorded yet.</p>
        </div>
      );

    return posts.map((post) => {
      const date = new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const habitTitle = post.Habit?.habitTitle || "General Post";

      return (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <div className="post-habit-badge">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5z"
                  fill="currentColor"
                />
              </svg>
              {habitTitle}
            </div>
            <div className="post-date">{date}</div>
          </div>
          <div className="post-content">
            <p>{post.content}</p>
          </div>
        </div>
      );
    });
  };

  const renderAchievements = () => {
    const unlockedIds = new Set(achievements.map((a) => a.id));

    const allAchievements = [
      { id: 1, name: "first_post", displayName: "First Post", icon: "✍️" },
      { id: 2, name: "streak_3_day", displayName: "3-Day Streak", icon: "🔥" },
      { id: 3, name: "streak_7_day", displayName: "7-Day Streak", icon: "🗓️" },
      { id: 4, name: "level_5", displayName: "Level 5", icon: "🚀" },
    ];

    return allAchievements.map((ach) => (
      <div
        key={ach.id}
        className={`achievement-badge-profile ${
          unlockedIds.has(ach.id) ? "unlocked" : "locked"
        }`}
      >
        <div className="achievement-icon-large">{ach.icon}</div>
        <div className="achievement-name">{ach.displayName}</div>
      </div>
    ));
  };

  // ------------------------
  // 4. MAIN JSX
  // ------------------------
  if (!user) return <div>Loading...</div>;

  const initials = user.username.substring(0, 2).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-circle-large">{initials}</div>
        <h2 className="profile-username">{user.username}</h2>
        <p className="profile-bio">
          Building habits in public. Following{" "}
          {user.communities?.join(", ") || "various"} communities.
        </p>
      </div>

      <div className="profile-stats">{renderStats()}</div>

      <h3>Activity</h3>
      <div className="activity-feed-container">{renderActivityFeed()}</div>

      <h3>Achievements</h3>
      <div className="achievements-grid-profile">{renderAchievements()}</div>
    </div>
  );
}
