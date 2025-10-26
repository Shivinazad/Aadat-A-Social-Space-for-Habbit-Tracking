// client/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Get References to HTML Elements (from profile.html) ---
    const avatarLarge = document.querySelector('.avatar-circle-large');
    const usernameHeader = document.querySelector('.profile-info-main h1');
    const bioParagraph = document.querySelector('.profile-bio'); // Get bio element

    // --- Selectors MATCHED TO YOUR HTML ---
    const statValueCurrentStreak = document.querySelector('.profile-stats .stat-item:nth-child(1) .stat-value');
    const statValueLongestStreak = document.querySelector('.profile-stats .stat-item:nth-child(2) .stat-value');
    const statValueLevel = document.querySelector('.profile-stats .stat-item:nth-child(3) .stat-value');
    const statValueXP = document.querySelector('.profile-stats .stat-item:nth-child(4) .stat-value');

    const achievementsGrid = document.querySelector('.achievements-grid');
    const activityFeed = document.querySelector('.activity-feed');


    // --- 3. Fetch User Profile Data ---
    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Could not fetch user profile');
            const user = await response.json();
            renderUserProfile(user);

            // Fetch habits to calculate stats
            await fetchUserHabits(user.id);

            // Fetch posts for activity feed
            await fetchUserPosts(user.id);

        } catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            window.location.href = 'Login.html';
        }
    }

    // --- 4. Fetch User Habits (for stats) ---
    async function fetchUserHabits(userId) {
         try {
             const response = await fetch('http://localhost:3000/api/habits', {
                 method: 'GET',
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             if (!response.ok) throw new Error('Could not fetch habits for stats');
             const habits = await response.json();
             renderUserStats(habits);

         } catch (error) {
             console.error('Error fetching habits for stats:', error);
             renderUserStats([]); // Render stats with 0 if fetching fails
         }
    }

    // --- 5. Fetch User Posts (for Activity Feed) ---
    async function fetchUserPosts(userId) {
        try {
            // NOTE: We need a backend route like GET /api/posts/user/:userId
            // For now, we'll use the general feed and filter locally
            const response = await fetch('http://localhost:3000/api/posts', {
                 method: 'GET',
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch posts');
            const allPosts = await response.json();

            // Filter posts by the current user
            const userPosts = allPosts.filter(post => post.userId === userId);
            renderActivityFeed(userPosts);

        } catch (error) {
             console.error('Error fetching posts:', error);
             if (activityFeed) activityFeed.innerHTML = '<p>Could not load activity feed.</p>';
        }
    }


    // --- 6. Render Functions ---
    function renderUserProfile(user) {
        if (!user) return;

        const initials = user.username.substring(0, 2).toUpperCase();
        if (avatarLarge) avatarLarge.textContent = initials;
        if (usernameHeader) usernameHeader.textContent = user.username;
        if (bioParagraph) {
            // Set a default bio or fetch from backend if added later
             bioParagraph.textContent = `Building habits in public. Following ${user.communities ? user.communities.join(', ') : 'various'} communities.`;
        }
        if (statValueLevel) statValueLevel.textContent = `Level ${user.user_level || 1}`;
        if (statValueXP) statValueXP.textContent = user.user_xp || 0;
    }

    function renderUserStats(habits) {
        let longestStreakOverall = 0;
        let currentStreakOverall = 0; // Find the highest current streak

        habits.forEach(habit => {
            if (habit.longestStreak > longestStreakOverall) {
                longestStreakOverall = habit.longestStreak;
            }
             if (habit.currentStreak > currentStreakOverall) {
                 currentStreakOverall = habit.currentStreak;
             }
        });

        if (statValueCurrentStreak) statValueCurrentStreak.textContent = currentStreakOverall;
        if (statValueLongestStreak) statValueLongestStreak.textContent = longestStreakOverall;
    }

    function renderActivityFeed(posts) {
        if (!activityFeed) return;

        // Clear existing static posts
        const feedTitle = activityFeed.querySelector('h2');
        activityFeed.innerHTML = ''; // Clear everything
        if(feedTitle) activityFeed.appendChild(feedTitle); // Put title back


        if (posts.length === 0) {
            activityFeed.innerHTML += '<p>No activity recorded yet.</p>'; // Append after title
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';

            // Format the date nicely
            const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            postCard.innerHTML = `
                <div class="post-header">
                    <span class="post-habit-tag">${post.Habit ? post.Habit.habitTitle : 'General Post'}</span>
                    <span class="post-date">${postDate}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
            `;
            activityFeed.appendChild(postCard);
        });
    }

    // --- 7. Initial Load ---
    fetchUserProfile();
});