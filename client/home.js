// client/home.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // --- 1. Auth Guard ---
    if (!token) {
        window.location.href = 'Login.html';
        return;
    }

    // --- 2. Get References to All HTML Elements ---
    // User Profile
    const userAvatar = document.querySelector('.user-avatar');
    const sidebarAvatar = document.querySelector('.avatar-circle');
    const sidebarUsername = document.querySelector('.profile-name');
    const xpCount = document.querySelector('.xp-count');
    const levelText = document.querySelector('.level-text');
    const progressBar = document.querySelector('.progress-bar');
    
    // Habits
    const habitsList = document.querySelector('.habit-list');
    const addHabitBtn = document.getElementById('add-habit-btn'); // New button

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check-in Modal
    const checkinModal = document.getElementById('checkin-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalPostBtn = document.getElementById('modal-post-btn');
    const modalTextarea = document.getElementById('modal-textarea');
    const charCounter = document.getElementById('char-counter');
    const maxChars = 280;

    // --- NEW: Add Habit Modal Elements ---
    const addHabitModal = document.getElementById('add-habit-modal');
    const addModalCloseBtn = document.getElementById('add-modal-close-btn');
    const addModalCancelBtn = document.getElementById('add-modal-cancel-btn');
    const addHabitForm = document.getElementById('add-habit-form');
    const habitTitleInput = document.getElementById('habit-title-input');
    const habitCategoryInput = document.getElementById('habit-category-input');
    
    // Invite Friends
    const inviteEmailInput = document.getElementById('invite-email-input');
    const inviteBtn = document.getElementById('invite-btn');
    
    // Toast
    const toastContainer = document.getElementById('toast-container');

    // --- 3. Theme Toggle Logic ---
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('light-mode');
            themeToggle.checked = false;
        }
    }
    themeToggle.addEventListener('change', () => {
        body.classList.toggle('light-mode');
        localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    });
    applySavedTheme();

    // --- 4. Modal & Toast Logic ---
    function showToast(message, type = 'success') {
        toastContainer.textContent = message;
        toastContainer.classList.add('show');
        
        // Add error class if type is error
        if (type === 'error') {
            toastContainer.classList.add('toast-error');
        } else {
            toastContainer.classList.remove('toast-error');
        }
        
        setTimeout(() => {
            toastContainer.classList.remove('show');
            toastContainer.classList.remove('toast-error');
        }, 3000); 
    }
    
    // Check-in Modal
    function openCheckinModal(habitId, habitName) {
        modalTitle.textContent = `Check-in: ${habitName}`;
        checkinModal.dataset.currentHabitId = habitId;
        modalTextarea.value = '';
        charCounter.textContent = maxChars;
        checkinModal.classList.add('open');
    }
    function closeCheckinModal() {
        checkinModal.classList.remove('open');
    }
    modalCloseBtn.addEventListener('click', closeCheckinModal);
    modalCancelBtn.addEventListener('click', closeCheckinModal);
    checkinModal.addEventListener('click', (event) => {
        if (event.target === checkinModal) closeCheckinModal();
    });
    modalTextarea.addEventListener('input', () => {
        const remaining = maxChars - modalTextarea.value.length;
        charCounter.textContent = remaining;
    });

    // --- NEW: Add Habit Modal Logic ---
    function openAddHabitModal() {
        habitTitleInput.value = '';
        habitCategoryInput.value = '';
        addHabitModal.classList.add('open');
    }
    function closeAddHabitModal() {
        addHabitModal.classList.remove('open');
    }
    addHabitBtn.addEventListener('click', openAddHabitModal);
    addModalCloseBtn.addEventListener('click', closeAddHabitModal);
    addModalCancelBtn.addEventListener('click', closeAddHabitModal);
    addHabitModal.addEventListener('click', (event) => {
        if (event.target === addHabitModal) closeAddHabitModal();
    });

    // --- 5. Fetch User Profile Data ---
    async function fetchUserData() {
        try {
            const response = await fetch('http://localhost:3000/api/users/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch user data');
            const user = await response.json();
            renderUserData(user);
        } catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            window.location.href = 'Login.html';
        }
    }

    // --- 6. Fetch User Habits ---
    async function fetchHabits() {
        try {
            const response = await fetch('http://localhost:3000/api/habits', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch habits');
            const habits = await response.json();
            renderHabits(habits);
        } catch (error) {
            console.error(error);
        }
    }

    // --- 7. Render Functions ---
    function renderUserData(user) {
        const initials = user.username.substring(0, 2).toUpperCase();
        if (userAvatar) userAvatar.textContent = initials;
        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (sidebarUsername) sidebarUsername.textContent = user.username;
        if (levelText) levelText.textContent = `Level ${user.user_level}`;
        if (xpCount) xpCount.textContent = `${user.user_xp} / 500 XP`;
        const xpPercentage = (user.user_xp / 500) * 100;
        if (progressBar) progressBar.style.width = `${xpPercentage}%`;
    }

    function renderHabits(habits) {
        if (!habitsList) return;
        habitsList.innerHTML = ''; 

        // Calculate the maximum current streak across all habits
        const maxStreak = habits.length > 0 
            ? Math.max(...habits.map(h => h.currentStreak || 0))
            : 0;
        
        // Update the welcome section streak
        const welcomeStreak = document.getElementById('welcome-streak');
        if (welcomeStreak) welcomeStreak.textContent = maxStreak;
        
        // Update the plant section streak
        const plantStreak = document.getElementById('plant-streak');
        if (plantStreak) plantStreak.textContent = maxStreak;

        if (habits.length === 0) {
            habitsList.innerHTML = '<p>You haven\'t added any habits yet. Add one to get started!</p>';
            return;
        }

        habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            habitItem.innerHTML = `
                <span>${habit.habitTitle}</span>
                <span class="streak-count">🔥 ${habit.currentStreak} days</span>
                <button class="btn btn-primary btn-checkin" data-habit-id="${habit.id}" data-habit-title="${habit.habitTitle}">Check In</button>
            `;
            habitsList.appendChild(habitItem);
        });
    }

    // --- 8. Event Listener for Dynamic "Check In" Buttons ---
    habitsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-checkin')) {
            const habitId = e.target.dataset.habitId;
            const habitTitle = e.target.dataset.habitTitle;
            openCheckinModal(habitId, habitTitle);
        }
    });

    // --- 9. Event Listener for "Post" Button in Modal ---
    modalPostBtn.addEventListener('click', async () => {
        const content = modalTextarea.value;
        const habitId = checkinModal.dataset.currentHabitId;
        if (content.length === 0) return alert('Please write something.');
        if (content.length > maxChars) return alert('Post is too long!');
        
        try {
            const response = await fetch('http://localhost:3000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content, habitId })
            });
            if (!response.ok) throw new Error('Failed to post check-in');

            closeCheckinModal();
            showToast('Check-in successful! 🎉');
            fetchHabits(); 
            fetchUserData(); 
        } catch (error) {
            console.error('Post Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // --- 10. NEW: Event Listener for "Save Habit" Button ---
    addHabitForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop form from reloading page
        const title = habitTitleInput.value;
        const category = habitCategoryInput.value;

        if (!title) {
            alert('Habit title is required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    habitTitle: title,
                    habitCategory: category
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to create habit');
            }

            // SUCCESS
            closeAddHabitModal();
            showToast('Habit added successfully! 💪');
            fetchHabits(); // Refresh the habit list to show the new one
        
        } catch (error) {
            console.error('Create Habit Error:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // --- 11. Invite Friends Functionality ---
    if (inviteBtn && inviteEmailInput) {
        inviteBtn.addEventListener('click', async () => {
            const email = inviteEmailInput.value.trim();
            
            // Validate email
            if (!email) {
                showToast('Please enter an email address', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }

            try {
                inviteBtn.disabled = true;
                inviteBtn.textContent = 'Sending...';

                const response = await fetch('http://localhost:3000/api/invite', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Failed to send invitation');
                }

                // SUCCESS
                showToast('Invitation sent successfully! 📧');
                inviteEmailInput.value = ''; // Clear the input
                
            } catch (error) {
                console.error('Invite Error:', error);
                showToast(error.message || 'Failed to send invitation', 'error');
            } finally {
                inviteBtn.disabled = false;
                inviteBtn.textContent = 'Send Invite';
            }
        });

        // Allow Enter key to send invite
        inviteEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                inviteBtn.click();
            }
        });
    }

    // --- 12. Initial Load ---
    fetchUserData();
    fetchHabits();
    fetchNotifications();
});