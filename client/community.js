// client/community.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const feedContainer = document.getElementById('feed-posts-container');
    const userAvatar = document.querySelector('.user-avatar');

    // --- 1. Auth Guard & Basic Setup ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Fetch User Data (for avatar) ---
     async function fetchCurrentUser() { /* ... (same as before) ... */
         try { const response = await fetch('http://localhost:3000/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) return; const user = await response.json(); if (userAvatar && user.username) { userAvatar.textContent = user.username.substring(0, 2).toUpperCase(); } } catch (error) { console.error("Error fetching user for avatar:", error); }
     }


    // --- 3. Fetch Feed Posts ---
    async function fetchFeedPosts() { /* ... (same as before) ... */
        try { const response = await fetch('http://localhost:3000/api/posts', { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) { throw new Error('Could not fetch feed posts'); } const posts = await response.json(); renderFeed(posts); } catch (error) { console.error('Feed Fetch Error:', error); if (feedContainer) { feedContainer.innerHTML = '<p>Error loading feed posts.</p>'; } if (error.message.includes('token') || error.message.includes('401') || error.message.includes('400')) { localStorage.removeItem('token'); window.location.href = 'Login.html'; } }
    }

    // --- 4. Render Feed Posts (UPDATED) ---
    function renderFeed(posts) {
        if (!feedContainer) return;
        feedContainer.innerHTML = ''; // Clear loading message

        if (!posts || posts.length === 0) {
            feedContainer.innerHTML = '<p>The feed is empty. Check in to a habit to start!</p>';
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.dataset.postId = post.id; // Add post ID for easy access

            const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const authorUsername = post.User ? post.User.username : 'Unknown User';
            const habitTitle = post.Habit ? post.Habit.habitTitle : 'General Post';

            // --- ADDED LIKE BUTTON ---
            postCard.innerHTML = `
                <div class="post-header">
                    <div>
                        <span class="post-author">${authorUsername}</span> checked in:
                        <span class="post-habit-tag">${habitTitle}</span>
                    </div>
                    <span class="post-date">${postDate}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                <div class="post-actions">
                    <button class="btn btn-secondary btn-like" data-post-id="${post.id}">Like 👍</button>
                    </div>
            `;
            feedContainer.appendChild(postCard);
        });
    }

    // --- 5. NEW: Event Listener for Like Buttons ---
    feedContainer.addEventListener('click', async (e) => {
        // Check if a like button was clicked
        if (e.target.classList.contains('btn-like')) {
            const likeButton = e.target;
            const postId = likeButton.dataset.postId;

            // Prevent double-clicking while request is processing
            likeButton.disabled = true;

            try {
                const response = await fetch(`http://localhost:3000/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        // No 'Content-Type' needed for empty body
                    },
                    // No body needed for this request
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Failed to like post');
                }

                // SUCCESS: Update button appearance
                likeButton.textContent = 'Liked ✓';
                likeButton.classList.remove('btn-secondary'); // Optional: change style
                likeButton.classList.add('btn-liked'); // Add a class for styling liked state
                // Note: Button remains disabled to prevent unliking for now

            } catch (error) {
                console.error('Like Error:', error);
                alert(`Error: ${error.message}`);
                likeButton.disabled = false; // Re-enable button on error
            }
        }
    });


    // --- 6. Initial Load ---
     fetchCurrentUser();
    fetchFeedPosts();
});