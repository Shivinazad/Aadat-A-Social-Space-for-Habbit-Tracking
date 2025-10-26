// client/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const leaderboardBody = document.getElementById('leaderboard-body');
    const userAvatar = document.querySelector('.user-avatar');

    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Fetch Current User Data (for avatar) ---
    async function fetchCurrentUser() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;
            const user = await response.json();
            if (userAvatar && user.username) {
                userAvatar.textContent = user.username.substring(0, 2).toUpperCase();
            }
        } catch (error) {
            console.error('Error fetching user for avatar:', error);
        }
    }

    // --- 3. Fetch Leaderboard Data ---
    async function fetchLeaderboard() {
        try {
            const response = await fetch('http://localhost:3000/api/leaderboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Could not fetch leaderboard data');
            }

            const leaderboardData = await response.json();
            renderLeaderboard(leaderboardData);

        } catch (error) {
            console.error('Leaderboard Fetch Error:', error);
            if (leaderboardBody) {
                leaderboardBody.innerHTML = '<tr><td colspan="4">Error loading leaderboard.</td></tr>';
            }
             // If token is bad, maybe redirect
             if (error.message.includes('token') || error.message.includes('401') || error.message.includes('400')) {
                localStorage.removeItem('token');
               // window.location.href = 'Login.html';
            }
        }
    }

    // --- 3. Render Leaderboard Table ---
    function renderLeaderboard(users) {
        if (!leaderboardBody) return;

        leaderboardBody.innerHTML = ''; // Clear loading message

        if (!users || users.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <div class="empty-icon">🏆</div>
                            <p>No rankings yet. Start building habits to appear here!</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Populate podium for top 3
        if (users.length >= 1) {
            const first = users[0];
            document.getElementById('podium-avatar-1').textContent = first.username.substring(0, 2).toUpperCase();
            document.getElementById('podium-name-1').textContent = first.username;
            document.getElementById('podium-level-1').textContent = first.user_level;
            document.getElementById('podium-xp-1').textContent = `${first.user_xp} XP`;
        }
        if (users.length >= 2) {
            const second = users[1];
            document.getElementById('podium-avatar-2').textContent = second.username.substring(0, 2).toUpperCase();
            document.getElementById('podium-name-2').textContent = second.username;
            document.getElementById('podium-level-2').textContent = second.user_level;
            document.getElementById('podium-xp-2').textContent = `${second.user_xp} XP`;
        }
        if (users.length >= 3) {
            const third = users[2];
            document.getElementById('podium-avatar-3').textContent = third.username.substring(0, 2).toUpperCase();
            document.getElementById('podium-name-3').textContent = third.username;
            document.getElementById('podium-level-3').textContent = third.user_level;
            document.getElementById('podium-xp-3').textContent = `${third.user_xp} XP`;
        }

        // Render full table (starting from rank 4 or all)
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            const rankClass = index < 3 ? 'top-rank' : '';
            
            let rankDisplay = index + 1;
            if (index === 0) rankDisplay = '🥇';
            else if (index === 1) rankDisplay = '🥈';
            else if (index === 2) rankDisplay = '🥉';
            
            row.className = rankClass;
            row.innerHTML = `
                <td class="rank-cell">${rankDisplay}</td>
                <td class="user-cell">
                    <div class="user-info">
                        <div class="user-avatar-small">${user.username.substring(0, 2).toUpperCase()}</div>
                        <span>${user.username}</span>
                    </div>
                </td>
                <td class="level-cell">Level ${user.user_level}</td>
                <td class="xp-cell">${user.user_xp.toLocaleString()} XP</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // --- 4. Initial Load ---
    fetchCurrentUser();
    fetchLeaderboard();
});