// client/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html'; return;
    }

    // --- 2. Get References ---
    const avatarLarge = document.querySelector('.avatar-circle-large');
    const usernameHeader = document.querySelector('.profile-info-main h1');
    const bioParagraph = document.querySelector('.profile-bio');
    const statValueCurrentStreak = document.querySelector('.profile-stats .stat-item:nth-child(1) .stat-value');
    const statValueLongestStreak = document.querySelector('.profile-stats .stat-item:nth-child(2) .stat-value');
    const statValueLevel = document.querySelector('.profile-stats .stat-item:nth-child(3) .stat-value');
    const statValueXP = document.querySelector('.profile-stats .stat-item:nth-child(4) .stat-value');
    const achievementsGrid = document.querySelector('.achievements-grid'); // Get achievements container
    const activityFeed = document.querySelector('.activity-feed');

    // --- 3. Fetch Functions ---
    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch user profile');
            const user = await response.json();
            renderUserProfile(user);
            await fetchUserHabits(user.id);
            await fetchUserPosts(user.id);
            await fetchUserAchievements(); // <-- Call new function
        } catch (error) { // ... error handling ...
             console.error(error); localStorage.removeItem('token'); window.location.href = 'Login.html';
         }
    }

    async function fetchUserHabits(userId) { // ... (no changes) ...
         try { const response = await fetch('http://localhost:3000/api/habits', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error('Could not fetch habits'); const habits = await response.json(); renderUserStats(habits); } catch (error) { console.error('Error fetching habits:', error); renderUserStats([]); }
     }

    async function fetchUserPosts(userId) { // ... (no changes) ...
         try { const response = await fetch('http://localhost:3000/api/posts', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error('Could not fetch posts'); const allPosts = await response.json(); const userPosts = allPosts.filter(post => post.userId === userId); renderActivityFeed(userPosts); } catch (error) { console.error('Error fetching posts:', error); if (activityFeed) activityFeed.innerHTML = '<p>Could not load activity feed.</p>'; }
     }

    // --- NEW: Fetch User Achievements ---
    async function fetchUserAchievements() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me/achievements', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch achievements');
            const unlockedAchievements = await response.json();
            renderAchievements(unlockedAchievements);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            if (achievementsGrid) achievementsGrid.innerHTML = '<p>Could not load achievements.</p>';
        }
    }

    // --- 4. Render Functions ---
    function renderUserProfile(user) { // ... (no changes) ...
         if (!user) return; const initials = user.username.substring(0, 2).toUpperCase(); if (avatarLarge) avatarLarge.textContent = initials; if (usernameHeader) usernameHeader.textContent = user.username; if (bioParagraph) { bioParagraph.textContent = `Building habits in public. Following ${user.communities ? user.communities.join(', ') : 'various'} communities.`; } if (statValueLevel) statValueLevel.textContent = `Level ${user.user_level || 1}`; if (statValueXP) statValueXP.textContent = user.user_xp || 0;
     }

    function renderUserStats(habits) { // ... (no changes) ...
         let longestStreakOverall = 0; let currentStreakOverall = 0; habits.forEach(habit => { if (habit.longestStreak > longestStreakOverall) longestStreakOverall = habit.longestStreak; if (habit.currentStreak > currentStreakOverall) currentStreakOverall = habit.currentStreak; }); if (statValueCurrentStreak) statValueCurrentStreak.textContent = currentStreakOverall; if (statValueLongestStreak) statValueLongestStreak.textContent = longestStreakOverall;
     }

    function renderActivityFeed(posts) { // ... (no changes) ...
         if (!activityFeed) return; const feedTitle = activityFeed.querySelector('h2'); activityFeed.innerHTML = ''; if(feedTitle) activityFeed.appendChild(feedTitle); if (posts.length === 0) { activityFeed.innerHTML += '<p>No activity recorded yet.</p>'; return; } posts.forEach(post => { const postCard = document.createElement('div'); postCard.className = 'post-card'; const postDate = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); postCard.innerHTML = `<div class="post-header"><span class="post-habit-tag">${post.Habit ? post.Habit.habitTitle : 'General Post'}</span><span class="post-date">${postDate}</span></div><div class="post-content"><p>${post.content}</p></div>`; activityFeed.appendChild(postCard); });
     }

    // --- NEW: Render Achievements ---
    function renderAchievements(unlockedAchievements) {
        if (!achievementsGrid) return;

        // Get the IDs of unlocked achievements for easy checking
        const unlockedIds = new Set(unlockedAchievements.map(ach => ach.id));

        // Clear static/previous badges
        achievementsGrid.innerHTML = ''; 

        // --- Define ALL possible achievements (Match IDs with database!) ---
        // You should fetch these from the backend later for flexibility
        const allAchievements = [
            { id: 1, name: 'first_post', displayName: 'First Post', icon: '✍️' },
            { id: 2, name: 'streak_3_day', displayName: '3-Day Streak', icon: '🔥' },
            // Add more achievements here as you define them
            { id: 3, name: 'streak_7_day', displayName: '7-Day Streak', icon: '🗓️' },
            { id: 4, name: 'level_5', displayName: 'Level 5', icon: '🚀' },
        ];

        // Render each achievement, marking as locked or unlocked
        allAchievements.forEach(ach => {
            const isUnlocked = unlockedIds.has(ach.id);
            const badge = document.createElement('div');
            badge.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
            badge.innerHTML = `
                <div class="badge-icon">${ach.icon}</div>
                <div class="badge-name">${ach.displayName}</div>
            `;
            achievementsGrid.appendChild(badge);
        });
    }

    // --- 5. Initial Load ---
    fetchUserProfile();
});