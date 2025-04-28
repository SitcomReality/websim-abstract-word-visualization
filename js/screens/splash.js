export function initSplashScreen(startGameCallback) {
    const splashScreen = document.getElementById('splash-screen');
    const startButton = document.getElementById('start-button');
    
    // Get elements for instruction carousel
    const instructionSlides = document.querySelectorAll('.instruction-slide');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentSlide = 0;
    const slideInterval = 8000; // 8 seconds between auto-advance
    let slideTimer;

    if (!startButton) {
        console.error("Start button not found!");
        return;
    }
    if (!splashScreen) {
        console.error("Splash screen not found!");
        return;
    }

    // Initialize instruction carousel
    function showSlide(index) {
        instructionSlides.forEach(slide => slide.classList.remove('active'));
        navDots.forEach(dot => dot.classList.remove('active'));
        
        instructionSlides[index].classList.add('active');
        navDots[index].classList.add('active');
        currentSlide = index;
        
        // Reset the auto-advance timer
        clearTimeout(slideTimer);
        slideTimer = setTimeout(nextSlide, slideInterval);
    }
    
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % instructionSlides.length;
        showSlide(nextIndex);
    }
    
    // Add click events to navigation dots
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Start the auto-advance
    slideTimer = setTimeout(nextSlide, slideInterval);

    startButton.addEventListener('click', () => {
        if (startGameCallback) {
            splashScreen.style.opacity = '0'; 
            splashScreen.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                splashScreen.classList.remove('active');
                splashScreen.style.display = 'none'; 
                startGameCallback(); 
            }, 500); 

        } else {
            console.error("Start game callback not provided to splash screen");
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) gameScreen.classList.add('active');
            splashScreen.classList.remove('active');
        }
    });
}