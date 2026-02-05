const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');

// Configuration for the no button behavior
const REPULSION_DISTANCE = 25; // Distance at which the button starts moving
const MOVEMENT_SPEED = 40; // Pixels to move per update
const BOUNDARY_PADDING = 20; // Padding from the edges of the window
const RETURN_DISTANCE = 150; // Distance at which button returns to initial position
const RETURN_SPEED = 100; // Speed at which button returns to initial position

// Track if yes has been clicked
let yesClicked = false;

// Store initial positions of both buttons
let initialYesBtnPos = null;
let initialNoBtnPos = null;

// Store current mouse/touch position
let currentMouseX = 0;
let currentMouseY = 0;

// Wait for DOM to be ready to capture initial positions
window.addEventListener('DOMContentLoaded', () => {
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    
    initialYesBtnPos = {
        left: yesRect.left,
        top: yesRect.top
    };
    
    initialNoBtnPos = {
        left: noRect.left,
        top: noRect.top
    };
    
    // Set both buttons to fixed position immediately to prevent layout shifts
    yesBtn.style.position = 'fixed';
    yesBtn.style.left = yesRect.left + 'px';
    yesBtn.style.top = yesRect.top + 'px';
    
    noBtn.style.position = 'fixed';
    noBtn.style.left = noRect.left + 'px';
    noBtn.style.top = noRect.top + 'px';
    
    // Start the animation loop
    requestAnimationFrame(updateButtonPosition);
});

// Yes button click handler
yesBtn.addEventListener('click', () => {
    if (!yesClicked) {
        yesClicked = true;
        showCelebration();
    }
});

// Track mouse position
document.addEventListener('mousemove', (e) => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
});

// Track touch position for mobile (touch-repel)
document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
        currentMouseX = e.touches[0].clientX;
        currentMouseY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
        currentMouseX = e.touches[0].clientX;
        currentMouseY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchend', () => {
    // Move the virtual cursor far away so the button returns
    currentMouseX = -9999;
    currentMouseY = -9999;
}, { passive: true });

// Continuous animation loop to update button position
function updateButtonPosition() {
    if (!yesClicked && initialNoBtnPos) {
        const noBtnRect = noBtn.getBoundingClientRect();
        const mouseX = currentMouseX;
        const mouseY = currentMouseY;

        // Calculate the closest point on the button to the cursor
        const closestX = Math.max(noBtnRect.left, Math.min(mouseX, noBtnRect.right));
        const closestY = Math.max(noBtnRect.top, Math.min(mouseY, noBtnRect.bottom));

        // Calculate distance between cursor and closest point on button
        const distance = Math.sqrt(
            Math.pow(mouseX - closestX, 2) + 
            Math.pow(mouseY - closestY, 2)
        );

        // If cursor is within repulsion distance of the button surface, move the button away
        if (distance < REPULSION_DISTANCE) {
            const buttonCenterX = noBtnRect.left + noBtnRect.width / 2;
            const buttonCenterY = noBtnRect.top + noBtnRect.height / 2;
            
            // Calculate direction away from cursor
            const angle = Math.atan2(buttonCenterY - mouseY, buttonCenterX - mouseX);
            
            // Calculate speed multiplier using quadratic function (closer = faster)
            // Normalized distance: 0 at button, 1 at REPULSION_DISTANCE
            const normalizedDistance = distance / REPULSION_DISTANCE;
            // Quadratic easing: (1 - x)^2 gives smooth acceleration as distance decreases
            const speedMultiplier = 1 + 3 * Math.pow(1 - normalizedDistance, 2);
            const actualSpeed = MOVEMENT_SPEED * speedMultiplier;
            
            // Calculate new position
            let newX = noBtnRect.left + Math.cos(angle) * actualSpeed;
            let newY = noBtnRect.top + Math.sin(angle) * actualSpeed;

            // Keep button within viewport bounds
            newX = Math.max(BOUNDARY_PADDING, Math.min(newX, window.innerWidth - noBtnRect.width - BOUNDARY_PADDING));
            newY = Math.max(BOUNDARY_PADDING, Math.min(newY, window.innerHeight - noBtnRect.height - BOUNDARY_PADDING));

            // Apply the new position
            noBtn.style.position = 'fixed';
            noBtn.style.left = newX + 'px';
            noBtn.style.top = newY + 'px';
        } else {
            // Always try to return to initial position when cursor is not close
            const currentLeft = noBtnRect.left;
            const currentTop = noBtnRect.top;
            
            const deltaX = initialNoBtnPos.left - currentLeft;
            const deltaY = initialNoBtnPos.top - currentTop;
            const distanceToInitial = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Only move if not already at initial position
            if (distanceToInitial > 1) {
                const moveX = (deltaX / distanceToInitial) * Math.min(RETURN_SPEED, distanceToInitial);
                const moveY = (deltaY / distanceToInitial) * Math.min(RETURN_SPEED, distanceToInitial);
                
                noBtn.style.position = 'fixed';
                noBtn.style.left = (currentLeft + moveX) + 'px';
                noBtn.style.top = (currentTop + moveY) + 'px';
            } else {
                // Keep at initial position when back
                noBtn.style.position = 'fixed';
                noBtn.style.left = initialNoBtnPos.left + 'px';
                noBtn.style.top = initialNoBtnPos.top + 'px';
            }
        }
    }
    
    // Continue the animation loop
    requestAnimationFrame(updateButtonPosition);
}

// Celebration function
function showCelebration() {
    // Add floating animation to yes button
    yesBtn.classList.add('floating');

    // Create confetti
    createConfetti();

    // Show message after a short delay
    setTimeout(() => {
        alert('🎉 You made me the happiest person! 💕');
    }, 500);
}

// Create confetti pieces
function createConfetti() {
    const confettiCount = 50;
    const colors = ['#ec4899', '#a78bfa', '#f472b6', '#c084fc', '#fbcfe8', '#e9d5ff'];

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.opacity = Math.random() * 0.7 + 0.3;
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';

        document.body.appendChild(confetti);

        // Remove confetti after animation completes
        setTimeout(() => confetti.remove(), 3500);
    }
}