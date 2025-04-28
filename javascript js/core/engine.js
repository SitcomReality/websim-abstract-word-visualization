import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false
        };
        this.lastTimestamp = 0;
    }

    init() {
        // Initialize screens
        initSplashScreen(this.switchToGameScreen.bind(this)); // Pass callback to switch screen
        const gameComponents = initGameScreen();

        // Store game components
        this.gameState.words = gameComponents.words;

        // Don't start game loop until screen is switched
    }

    switchToGameScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const gameScreen = document.getElementById('game-screen');

        if (splashScreen) splashScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');

        this.gameState.currentScreen = 'game';
        this.gameState.active = true;
        this.lastTimestamp = performance.now(); // Initialize timestamp
        this.startGameLoop(); // Start loop only when game screen is active
    }

    startGameLoop() {
        const loop = (timestamp) => {
            if (!this.gameState.active) return; // Stop loop if game is not active

            const dt = (timestamp - this.lastTimestamp) / 16.67; // Calculate delta time (normalize to 60fps)
            this.lastTimestamp = timestamp;

            // Update game state based on the current screen
            if (this.gameState.currentScreen === 'game') {
                this.updateGame(dt);
            }

            // Request next frame
            requestAnimationFrame(loop);
        };

        // Start the loop
        requestAnimationFrame(loop);
    }

    updateGame(dt) {
        // Update all words
        this.gameState.words.forEach(word => word.update(dt));
    }

    stopGameLoop() {
        this.gameState.active = false;
    }
}