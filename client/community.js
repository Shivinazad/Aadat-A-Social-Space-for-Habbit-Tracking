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

    // --- 3. Fetch Feed Posts ---
    async function fetchFeedPosts() {
        try {
            const response = await fetch('http://localhost:3000/api/posts', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error('Could not fetch feed posts');
            }
            const posts = await response.json();
            renderFeed(posts);
        } catch (error) {
            console.error('Feed Fetch Error:', error);
            if (feedContainer) {
                feedContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">⚠️</div>
                        <h3>Error loading feed</h3>
                        <p>Please try refreshing the page.</p>
                    </div>
                `;
            }
            if (error.message.includes('token') || error.message.includes('401') || error.message.includes('400')) {
                localStorage.removeItem('token');
                window.location.href = 'Login.html';
            }
        }
    }

    // --- 4. Render Feed Posts (UPDATED AGAIN) ---
function renderFeed(posts) {
    if (!feedContainer) return;
    feedContainer.innerHTML = ''; // Clear loading message

    if (!posts || posts.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No posts yet</h3>
                <p>Be the first to share your progress! Check in to a habit from your dashboard.</p>
            </div>
        `;
        return;
    }

    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = post.id;

        const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        const authorUsername = post.User ? post.User.username : 'Unknown User';
        const authorInitials = authorUsername.substring(0, 2).toUpperCase();
        const habitTitle = post.Habit ? post.Habit.habitTitle : 'General Post';

        // --- Determine initial button state based on API response ---
        const isLiked = post.isLikedByCurrentUser;
        const buttonText = isLiked ? 'Liked' : 'Like';
        const buttonClass = isLiked ? 'btn-like liked' : 'btn-like';
        const buttonDisabled = isLiked ? 'disabled' : '';
        // --- End button state logic ---

        postCard.innerHTML = `
            <div class="post-header">
                <div class="post-author-info">
                    <div class="post-avatar">${authorInitials}</div>
                    <div class="post-meta">
                        <div class="post-author-name">${authorUsername}</div>
                        <div class="post-date">${postDate}</div>
                    </div>
                </div>
                <div class="post-habit-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 1l2.5 5 5.5.5-4 4 1 5.5L8 13l-5 3 1-5.5-4-4 5.5-.5z" fill="currentColor"/>
                    </svg>
                    ${habitTitle}
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            <div class="post-actions">
                <button class="${buttonClass}" data-post-id="${post.id}" ${buttonDisabled}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" stroke="currentColor" stroke-width="1.5" fill="${isLiked ? 'currentColor' : 'none'}"/>
                    </svg>
                    ${buttonText}
                </button>
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
                likeButton.textContent = 'Liked';
                likeButton.classList.add('liked');
                likeButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" stroke="currentColor" stroke-width="1.5" fill="currentColor"/>
                    </svg>
                    Liked
                `;
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