document.addEventListener('DOMContentLoaded', () => {
    const communityCards = document.querySelectorAll('.community-card');
    const continueBtn = document.getElementById('continue-btn');

    // Function to check how many cards are selected
    function updateContinueButtonState() {
        const selectedCards = document.querySelectorAll('.community-card.selected');
        if (selectedCards.length > 0) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }

    // Add a click listener to each community card
    communityCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle the 'selected' class on the card
            card.classList.toggle('selected');
            // Update the continue button's state
            updateContinueButtonState();
        });
    });

    // Add logic for the continue button
    continueBtn.addEventListener('click', () => {
        if (!continueBtn.disabled) {
            const selectedCommunities = [];
            const selectedCards = document.querySelectorAll('.community-card.selected');
            
            selectedCards.forEach(card => {
                selectedCommunities.push(card.dataset.community);
            });

            console.log('User selected:', selectedCommunities);
            // Here you would typically send this data to your backend
            // and then redirect the user to the home page.
            
            // For now, we'll just redirect to home.html
            window.location.href = 'home.html';
        }
    });

    // Initialize the button state on page load
    updateContinueButtonState();
});