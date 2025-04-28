export function initSplashScreen(startGameCallback) {
    const splashScreen = document.getElementById('splash-screen');
    const startButton = document.getElementById('start-button');

    if (!startButton) {
        console.error("Start button not found!");
        return;
    }

    startButton.addEventListener('click', () => {
        if (startGameCallback) {
            startGameCallback();
        } else {
            console.error("Start game callback not provided to splash screen");
            const gameScreen = document.getElementById('game-screen');
            if (splashScreen) splashScreen.classList.remove('active');
            if (gameScreen) gameScreen.classList.add('active');
        }
    });
}