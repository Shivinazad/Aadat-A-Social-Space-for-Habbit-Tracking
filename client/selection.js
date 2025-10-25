// client/selection.js

document.addEventListener('DOMContentLoaded', () => {
    // Selectors are now matched to your HTML
    const communityCards = document.querySelectorAll('.community-card');
    const continueButton = document.getElementById('continue-btn'); // <-- FIXED: Use the ID selector
    
    const selectedCommunities = new Set(); // Use a Set to avoid duplicates

    // --- 1. SET INITIAL BUTTON STATE ---
    // The button is already disabled in the HTML, which is perfect.
    // We just need to enable it.
    
    // --- 2. ADD CLICK LISTENERS ---
    communityCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle the 'selected' class
            card.classList.toggle('selected');
            
            // Get the community name from the data-community attribute
            const communityName = card.dataset.community; // <-- FIXED: Use the data-community attribute

            if (card.classList.contains('selected')) {
                selectedCommunities.add(communityName);
            } else {
                selectedCommunities.delete(communityName);
            }

            // --- 3. UPDATE BUTTON STATE ---
            // Enable the button ONLY if one or more communities are selected
            continueButton.disabled = (selectedCommunities.size === 0);
        });
    });

    // --- 4. "CONTINUE" BUTTON CLICK HANDLER ---
    continueButton.addEventListener('click', async () => {
        // Get the auth token from storage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You are not logged in. Redirecting to login.');
            window.location.href = 'Login.html';
            return;
        }

        // Convert the Set of communities to an array
        const communitiesArray = Array.from(selectedCommunities);

        try {
            const response = await fetch('http://localhost:3000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the auth token
                },
                body: JSON.stringify({
                    communities: communitiesArray
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to save communities');
            }

            // SUCCESS: Redirect to the main dashboard
            window.location.href = 'home.html';

        } catch (error) {
            console.error('Error saving communities:', error);
            alert(`Error: ${error.message}`);
        }
    });
});