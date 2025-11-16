import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ----------------------
  // AUTH GUARD
  // ----------------------
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // ----------------------
  // STATE
  // ----------------------
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);

  // Theme
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // Toast
  const [toast, setToast] = useState({ message: "", type: "success", show: false });

  // Modals
  const [isCheckinOpen, setCheckinOpen] = useState(false);
  const [isAddHabitOpen, setAddHabitOpen] = useState(false);

  // Check-in modal fields
  const [currentHabitId, setCurrentHabitId] = useState(null);
  const [currentHabitName, setCurrentHabitName] = useState("");
  const [checkinText, setCheckinText] = useState("");

  const maxChars = 280;

  // Add habit modal fields
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("");

  // Invite
  const [inviteEmail, setInviteEmail] = useState("");

  // ----------------------
  // SHOW TOAST
  // ----------------------
  function showToast(message, type = "success") {
    setToast({ message, type, show: true });
    setTimeout(() => {
      setToast({ message: "", type: "success", show: false });
    }, 3000);
  }

  // ----------------------
  // THEME TOGGLE
  // ----------------------
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ----------------------
  // OPEN / CLOSE MODALS
  // ----------------------
  function openCheckinModal(habitId, habitName) {
    setCurrentHabitId(habitId);
    setCurrentHabitName(habitName);
    setCheckinText("");
    setCheckinOpen(true);
  }

  function closeCheckinModal() {
    setCheckinOpen(false);
  }

  function openAddHabitModal() {
    setNewHabitTitle("");
    setNewHabitCategory("");
    setAddHabitOpen(true);
  }

  function closeAddHabitModal() {
    setAddHabitOpen(false);
  }

  // ----------------------
  // FETCH USER
  // ----------------------
  async function fetchUserData() {
    try {
      const response = await fetch("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      setUser(data);
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }

  // ----------------------
  // FETCH HABITS
  // ----------------------
  async function fetchHabits() {
    try {
      const response = await fetch("http://localhost:3000/api/habits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch habits");
      const data = await response.json();
      setHabits(data);
    } catch (error) {
      console.error(error);
    }
  }

  // ----------------------
  // SUBMIT CHECK-IN POST
  // ----------------------
  async function submitCheckin() {
    if (checkinText.length === 0) return alert("Please write something.");
    if (checkinText.length > maxChars) return alert("Too long.");

    try {
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: checkinText,
          habitId: currentHabitId,
        }),
      });

      if (!response.ok) throw new Error("Failed to post");

      closeCheckinModal();
      showToast("Check-in successful! 🎉");
      fetchHabits();
      fetchUserData();
    } catch (error) {
      alert(error.message);
    }
  }

  // ----------------------
  // CREATE NEW HABIT
  // ----------------------
  async function createHabit(e) {
    e.preventDefault();

    if (!newHabitTitle) {
      alert("Habit title is required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          habitTitle: newHabitTitle,
          habitCategory: newHabitCategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || "Failed to create");
      }

      closeAddHabitModal();
      showToast("Habit added successfully! 💪");
      fetchHabits();
    } catch (error) {
      alert(error.message);
    }
  }

  // ----------------------
  // INVITE FRIENDS
  // ----------------------
  async function sendInvite() {
    const email = inviteEmail.trim();
    if (!email) return showToast("Email required", "error");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return showToast("Invalid email", "error");

    try {
      const response = await fetch("http://localhost:3000/api/invite", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Failed");

      showToast("Invitation sent! 📧");
      setInviteEmail("");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  // ----------------------
  // LOAD DATA ON MOUNT
  // ----------------------
  useEffect(() => {
    fetchUserData();
    fetchHabits();
  }, []);

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div className="home-page">
      {/* TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : ""}`}>
          {toast.message}
        </div>
      )}

      {/* SIDEBAR USER */}
      <div className="sidebar">
        {user && (
          <>
            <div className="avatar-circle">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-name">{user.username}</div>
            <div className="level-text">Level {user.user_level}</div>
            <div className="xp-count">{user.user_xp} / 500 XP</div>

            <div className="progress-wrapper">
              <div
                className="progress-bar"
                style={{ width: `${(user.user_xp / 500) * 100}%` }}
              />
            </div>
          </>
        )}

        {/* THEME TOGGLE */}
        <label>
          <input
            type="checkbox"
            checked={theme === "light"}
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
          />
          Light Mode
        </label>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        <h2>Your Habits</h2>

        <button id="add-habit-btn" onClick={openAddHabitModal}>
          + Add Habit
        </button>

        {/* HABIT LIST */}
        <div className="habit-list">
          {habits.length === 0 ? (
            <p>No habits yet.</p>
          ) : (
            habits.map((habit) => (
              <div key={habit.id} className="habit-item">
                <span>{habit.habitTitle}</span>
                <span className="streak-count">🔥 {habit.currentStreak} days</span>
                <button
                  className="btn-checkin"
                  onClick={() => openCheckinModal(habit.id, habit.habitTitle)}
                >
                  Check In
                </button>
              </div>
            ))
          )}
        </div>

        {/* INVITE FRIENDS */}
        <div className="invite-section">
          <h3>Invite Friends</h3>
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
          />
          <button onClick={sendInvite}>Send Invite</button>
        </div>
      </div>

      {/* CHECK-IN MODAL */}
      {isCheckinOpen && (
        <div className="modal-bg" onClick={closeCheckinModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Check-in: {currentHabitName}</h2>
            <textarea
              value={checkinText}
              onChange={(e) => setCheckinText(e.target.value)}
              maxLength={280}
            />
            <div>{maxChars - checkinText.length} characters left</div>

            <div className="modal-actions">
              <button onClick={closeCheckinModal}>Cancel</button>
              <button onClick={submitCheckin}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HABIT MODAL */}
      {isAddHabitOpen && (
        <div className="modal-bg" onClick={closeAddHabitModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Habit</h2>

            <form onSubmit={createHabit}>
              <input
                placeholder="Habit Title"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
              />

              <input
                placeholder="Category (optional)"
                value={newHabitCategory}
                onChange={(e) => setNewHabitCategory(e.target.value)}
              />

              <div className="modal-actions">
                <button type="button" onClick={closeAddHabitModal}>Cancel</button>
                <button type="submit">Save Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
