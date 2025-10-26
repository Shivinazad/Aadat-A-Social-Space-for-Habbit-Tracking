// client/notifications.js - Shared notification functionality

function initializeNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const notificationBtn = document.getElementById('notification-btn');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    const notificationsList = document.getElementById('notifications-list');
    const notificationCount = document.getElementById('notification-count');
    const markAllReadBtn = document.getElementById('mark-all-read');

    let notifications = [];

    // Toggle notifications dropdown
    if (notificationBtn) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationsDropdown && !notificationsDropdown.contains(e.target) && e.target !== notificationBtn) {
            notificationsDropdown.classList.remove('active');
        }
    });

    // Mark all as read
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:3000/api/notifications/mark-read', {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    notifications = notifications.map(n => ({ ...n, read: true }));
                    renderNotifications();
                    updateNotificationBadge();
                }
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        });
    }

    // Fetch notifications
    async function fetchNotifications() {
        try {
            const response = await fetch('http://localhost:3000/api/notifications', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                notifications = await response.json();
                renderNotifications();
                updateNotificationBadge();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    // Render notifications
    function renderNotifications() {
        if (!notificationsList) return;

        if (notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <div class="empty-icon">🔔</div>
                    <p>No new notifications</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = '';
        notifications.forEach(notification => {
            const item = document.createElement('div');
            item.className = `notification-item ${!notification.read ? 'unread' : ''}`;
            
            const timeAgo = getTimeAgo(new Date(notification.createdAt));
            const senderInitials = notification.senderUsername 
                ? notification.senderUsername.substring(0, 2).toUpperCase() 
                : '?';

            item.innerHTML = `
                <div class="notification-avatar">${senderInitials}</div>
                <div class="notification-content">
                    <div class="notification-text">
                        <strong>${notification.senderUsername || 'Someone'}</strong> ${notification.message}
                    </div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                ${!notification.read ? '<div class="notification-unread-dot"></div>' : ''}
            `;

            item.addEventListener('click', async () => {
                if (!notification.read) {
                    await markNotificationAsRead(notification.id);
                }
                if (notification.postId) {
                    window.location.href = 'community.html';
                }
            });

            notificationsList.appendChild(item);
        });
    }

    // Update notification badge
    function updateNotificationBadge() {
        const unreadCount = notifications.filter(n => !n.read).length;
        if (notificationCount) {
            if (unreadCount > 0) {
                notificationCount.textContent = unreadCount > 9 ? '9+' : unreadCount;
                notificationCount.style.display = 'flex';
            } else {
                notificationCount.style.display = 'none';
            }
        }
    }

    // Mark single notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                notifications = notifications.map(n => 
                    n.id === notificationId ? { ...n, read: true } : n
                );
                renderNotifications();
                updateNotificationBadge();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Time ago helper
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }
        return 'Just now';
    }

    // Initial fetch
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    setInterval(fetchNotifications, 30000);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotifications);
} else {
    initializeNotifications();
}
