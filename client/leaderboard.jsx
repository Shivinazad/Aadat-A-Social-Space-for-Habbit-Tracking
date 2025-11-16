
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [currentUserInitials, setCurrentUserInitials] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch current user for avatar initials
  useEffect(() => {
    async function fetchCurrentUser() {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3000/api/users/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const user = await res.json();
        if (user?.username) setCurrentUserInitials(user.username.substring(0, 2).toUpperCase());
      } catch (err) {
        console.error("Error fetching user for avatar:", err);
      }
    }
    fetchCurrentUser();
  }, [token]);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/leaderboard", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const msg = payload.msg || "Could not fetch leaderboard data";
          throw new Error(msg);
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Leaderboard Fetch Error:", err);
        setError(err.message || "Error loading leaderboard.");
        // If token issues, clear token and redirect to login
        if (/token|401|400/i.test(err.message || "")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [token, navigate]);

  // Helper to format rank display
  function rankDisplay(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  }

  return (
    <div className="leaderboard-page">
      {/* Top bar avatar (if you still want it) */}
      <div className="header-avatar">
        <div className="user-avatar">{currentUserInitials || ""}</div>
      </div>

      <h1>Leaderboard</h1>

      {loading && (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <p>Loading leaderboard...</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Podium for top 3 */}
          <div className="podium">
            <div className="podium-item podium-2">
              <div id="podium-avatar-2" className="podium-avatar">
                {users[1]?.username?.substring(0, 2).toUpperCase() || ""}
              </div>
              <div id="podium-name-2" className="podium-name">
                {users[1]?.username || ""}
              </div>
              <div id="podium-level-2" className="podium-level">
                {users[1] ? `Level ${users[1].user_level}` : ""}
              </div>
              <div id="podium-xp-2" className="podium-xp">
                {users[1] ? `${users[1].user_xp} XP` : ""}
              </div>
            </div>

            <div className="podium-item podium-1">
              <div id="podium-avatar-1" className="podium-avatar">
                {users[0]?.username?.substring(0, 2).toUpperCase() || ""}
              </div>
              <div id="podium-name-1" className="podium-name">
                {users[0]?.username || ""}
              </div>
              <div id="podium-level-1" className="podium-level">
                {users[0] ? `Level ${users[0].user_level}` : ""}
              </div>
              <div id="podium-xp-1" className="podium-xp">
                {users[0] ? `${users[0].user_xp} XP` : ""}
              </div>
            </div>

            <div className="podium-item podium-3">
              <div id="podium-avatar-3" className="podium-avatar">
                {users[2]?.username?.substring(0, 2).toUpperCase() || ""}
              </div>
              <div id="podium-name-3" className="podium-name">
                {users[2]?.username || ""}
              </div>
              <div id="podium-level-3" className="podium-level">
                {users[2] ? `Level ${users[2].user_level}` : ""}
              </div>
              <div id="podium-xp-3" className="podium-xp">
                {users[2] ? `${users[2].user_xp} XP` : ""}
              </div>
            </div>
          </div>

          {/* Leaderboard table */}
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Level</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody id="leaderboard-body">
                {(!users || users.length === 0) ? (
                  <tr>
                    <td colSpan="4">
                      <div className="empty-state">
                        <div className="empty-icon">🏆</div>
                        <p>No rankings yet. Start building habits to appear here!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u, idx) => (
                    <tr key={u.id || u.username} className={idx < 3 ? "top-rank" : ""}>
                      <td className="rank-cell">{rankDisplay(idx)}</td>
                      <td className="user-cell">
                        <div className="user-info">
                          <div className="user-avatar-small">
                            {u.username?.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{u.username}</span>
                        </div>
                      </td>
                      <td className="level-cell">Level {u.user_level}</td>
                      <td className="xp-cell">{Number(u.user_xp).toLocaleString()} XP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
