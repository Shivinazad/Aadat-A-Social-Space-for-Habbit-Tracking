// client/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const leaderboardBody = document.getElementById('leaderboard-body');

    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Fetch Leaderboard Data ---
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
            leaderboardBody.innerHTML = '<tr><td colspan="4">Leaderboard is empty.</td></tr>';
            return;
        }

        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.user_level}</td>
                <td>${user.user_xp}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // --- 4. Initial Load ---
    fetchLeaderboard();
});