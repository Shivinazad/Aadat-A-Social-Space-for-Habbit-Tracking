// client/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Get References ---
    const userAvatar = document.querySelector('.user-avatar');
    const avatarLarge = document.querySelector('.avatar-circle-large');
    const usernameHeader = document.querySelector('.profile-username');
    const bioParagraph = document.querySelector('.profile-bio');
    const statCards = document.querySelectorAll('.profile-stat-card .stat-number');
    const achievementsGrid = document.querySelector('.achievements-grid-profile');
    const activityFeedContainer = document.querySelector('.activity-feed-container');

    // --- 3. Fetch User Profile ---
    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch user profile');
            const user = await response.json();
            renderUserProfile(user);
            await fetchUserHabits(user.id);
            await fetchUserPosts(user.id);
            await fetchUserAchievements();
        } catch (error) {
            console.error('Profile Fetch Error:', error);
            localStorage.removeItem('token');
            window.location.href = 'Login.html';
        }
    }

    // --- 4. Fetch User Habits ---
    async function fetchUserHabits(userId) {
        try {
            const response = await fetch('http://localhost:3000/api/habits', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch habits');
            const habits = await response.json();
            renderUserStats(habits);
        } catch (error) {
            console.error('Error fetching habits:', error);
            renderUserStats([]);
        }
    }

    // --- 5. Fetch User Posts ---
    async function fetchUserPosts(userId) {
        try {
            const response = await fetch('http://localhost:3000/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch posts');
            const allPosts = await response.json();
            const userPosts = allPosts.filter(post => post.userId === userId);
            renderActivityFeed(userPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (activityFeedContainer) {
                activityFeedContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <p>Could not load activity feed.</p>
                    </div>
                `;
            }
        }
    }

    // --- 6. Fetch User Achievements ---
    async function fetchUserAchievements() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me/achievements', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                console.log('Achievements endpoint not available, using default display');
                return;
            }
            
            const unlockedAchievements = await response.json();
            renderAchievements(unlockedAchievements);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            // Keep default achievements visible
        }
    }

    // --- 7. Render User Profile ---
    function renderUserProfile(user) {
        if (!user) return;
        
        const initials = user.username.substring(0, 2).toUpperCase();
        
        if (userAvatar) userAvatar.textContent = initials;
        if (avatarLarge) avatarLarge.textContent = initials;
        if (usernameHeader) usernameHeader.textContent = user.username;
        
        if (bioParagraph) {
            const communities = user.communities && user.communities.length > 0 
                ? user.communities.join(', ') 
                : 'various';
            bioParagraph.textContent = `Building habits in public. Following ${communities} communities.`;
        }
        
        // Update level and XP
        if (statCards.length >= 4) {
            statCards[2].textContent = `Level ${user.user_level || 1}`;
            statCards[3].textContent = user.user_xp || 0;
        }
    }

    // --- 8. Render User Stats ---
    function renderUserStats(habits) {
        let longestStreakOverall = 0;
        let currentStreakOverall = 0;
        
        habits.forEach(habit => {
            if (habit.longestStreak > longestStreakOverall) {
                longestStreakOverall = habit.longestStreak;
            }
            if (habit.currentStreak > currentStreakOverall) {
                currentStreakOverall = habit.currentStreak;
            }
        });
        
        if (statCards.length >= 2) {
            statCards[0].textContent = currentStreakOverall;
            statCards[1].textContent = longestStreakOverall;
        }
    }

    // --- 9. Render Activity Feed ---
    function renderActivityFeed(posts) {
        if (!activityFeedContainer) return;
        
        activityFeedContainer.innerHTML = '';
        
        if (posts.length === 0) {
            activityFeedContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No activity recorded yet.</p>
                </div>
            `;
            return;
        }
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            
            const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            const habitTitle = post.Habit ? post.Habit.habitTitle : 'General Post';
            
            postCard.innerHTML = `
                <div class="post-header">
                    <div class="post-habit-badge">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5z" fill="currentColor"/>
                        </svg>
                        ${habitTitle}
                    </div>
                    <div class="post-date">${postDate}</div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
            `;
            
            activityFeedContainer.appendChild(postCard);
        });
    }

    // --- 10. Render Achievements ---
    function renderAchievements(unlockedAchievements) {
        if (!achievementsGrid) return;
        
        const unlockedIds = new Set(unlockedAchievements.map(ach => ach.id));
        achievementsGrid.innerHTML = '';
        
        const allAchievements = [
            { id: 1, name: 'first_post', displayName: 'First Post', icon: '✍️' },
            { id: 2, name: 'streak_3_day', displayName: '3-Day Streak', icon: '🔥' },
            { id: 3, name: 'streak_7_day', displayName: '7-Day Streak', icon: '🗓️' },
            { id: 4, name: 'level_5', displayName: 'Level 5', icon: '🚀' },
        ];
        
        allAchievements.forEach(ach => {
            const isUnlocked = unlockedIds.has(ach.id);
            const badge = document.createElement('div');
            badge.className = `achievement-badge-profile ${isUnlocked ? 'unlocked' : 'locked'}`;
            badge.innerHTML = `
                <div class="achievement-icon-large">${ach.icon}</div>
                <div class="achievement-name">${ach.displayName}</div>
            `;
            achievementsGrid.appendChild(badge);
        });
    }

    // --- 11. Initial Load ---
    fetchUserProfile();
});
