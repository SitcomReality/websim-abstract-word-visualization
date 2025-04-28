export function initSplashScreen(startGameCallback) {
    const splashScreen = document.getElementById('splash-screen');
    const startButton = document.getElementById('start-button');

    if (!startButton) {
        console.error("Start button not found!");
        return;
    }
    if (!splashScreen) {
        console.error("Splash screen not found!");
        return;
    }

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