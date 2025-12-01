
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/api';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const notificationRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    document.body.classList.toggle('dark-mode', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data.filter(n => !n.read));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!user) return null;

  const renderAvatarElement = () => {
    const avatar = user?.avatar;
    if (!avatar) return '👤';
    if (typeof avatar === 'string' && avatar.startsWith('http')) {
      return (
        <img
          src={avatar}
          alt={user?.username || 'avatar'}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#222' }}
        />
      );
    }
    return avatar;
  };
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="brand">
            Aadat<span className="neon-dot"></span>
          </Link>
        </div>
        <div className="nav-links-center">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
          <Link to="/community" className={`nav-link ${isActive('/community')}`}>Community</Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Leaderboard</Link>
        </div>
        <div className="nav-icons">
          <div className="notification-container" ref={notificationRef}>
            <button className="icon-btn notification-btn" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13112C12.5979 2.19344 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19344 6.46447 3.13112C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5788 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42117 18.2537 9.16816 18.1079C8.91514 17.9622 8.70484 17.7526 8.55835 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown open">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all as read</button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">
                      <div className="empty-icon">🔔</div>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="notification-item">
                        <div className="notification-content">
                          <strong>{notif.senderUsername}</strong> {notif.message}
                        </div>
                        <div className="notification-time">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle dark mode">
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
            )}
          </button>
          <Link to="/profile" className="user-avatar" aria-label="Profile">{renderAvatarElement()}</Link>
          {/* Hamburger for mobile */}
          <button className={`hamburger${mobileMenuOpen ? ' open' : ''}`} aria-label="Toggle menu" onClick={() => setMobileMenuOpen((open) => !open)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      {/* Mobile nav links dropdown */}
      <div className={`nav-links-mobile${mobileMenuOpen ? ' open' : ''}`}>
        <Link 
          to="/dashboard" 
          className={`nav-link ${isActive('/dashboard')}`} 
          onClick={() => setMobileMenuOpen(false)}
          style={theme === 'light' ? { color: '#000000 !important' } : {}}
        >
          Dashboard
        </Link>
        <Link 
          to="/community" 
          className={`nav-link ${isActive('/community')}`} 
          onClick={() => setMobileMenuOpen(false)}
          style={theme === 'light' ? { color: '#000000 !important' } : {}}
        >
          Community
        </Link>
        <Link 
          to="/leaderboard" 
          className={`nav-link ${isActive('/leaderboard')}`} 
          onClick={() => setMobileMenuOpen(false)}
          style={theme === 'light' ? { color: '#000000 !important' } : {}}
        >
          Leaderboard
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
