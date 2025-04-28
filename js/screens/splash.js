export function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    
    startButton.addEventListener('click', () => {
        splashScreen.classList.remove('active');
        gameScreen.classList.add('active');
    });
}

