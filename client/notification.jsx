// src/components/Notifications.jsx
import { useEffect, useState, useRef } from "react";

export default function Notifications() {
  const token = localStorage.getItem("token");

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef();
  const buttonRef = useRef();

  // -------------------------
  // Fetch Notifications
  // -------------------------
  async function fetchNotifications() {
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  // -------------------------
  // Mark all as read
  // -------------------------
  async function markAllAsRead() {
    try {
      const res = await fetch(
        "http://localhost:3000/api/notifications/mark-read",
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  }

  // -------------------------
  // Mark single notification as read
  // -------------------------
  async function markNotificationAsRead(id) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  }

  // -------------------------
  // Polling every 5 seconds
  // -------------------------
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------
  // Close dropdown on outside click
  // -------------------------
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // -------------------------
  // Time Ago Helper
  // -------------------------
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (const [unit, unitSeconds] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / unitSeconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  }

  // -------------------------
  // Unread Count
  // -------------------------
  const unreadCount = notifications.filter((n) => !n.read).length;

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="notifications-wrapper">
      {/* Button */}
      <button
        id="notification-btn"
        ref={buttonRef}
        className="notification-button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span id="notification-count" className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {dropdownOpen && (
        <div
          id="notifications-dropdown"
          className="notifications-dropdown active"
          ref={dropdownRef}
        >
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                id="mark-all-read"
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                Mark All Read
              </button>
            )}
          </div>

          <div id="notifications-list" className="notifications-list">
            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="notifications-empty">
                <div className="empty-icon">🔔</div>
                <p>No new notifications</p>
              </div>
            )}

            {/* Notification Items */}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${!n.read ? "unread" : ""}`}
                onClick={async () => {
                  if (!n.read) await markNotificationAsRead(n.id);
                  if (n.postId) {
                    window.location.href = "/community";
                  }
                }}
              >
                <div className="notification-avatar">
                  {(n.senderUsername || "?")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>

                <div className="notification-content">
                  <div className="notification-text">
                    <strong>{n.senderUsername || "Someone"}</strong>{" "}
                    {n.message}
                  </div>
                  <div className="notification-time">
                    {getTimeAgo(new Date(n.createdAt))}
                  </div>
                </div>

                {!n.read && <div className="notification-unread-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
