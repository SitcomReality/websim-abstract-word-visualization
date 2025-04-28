import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false
        };
    }
    
    init() {
        // Initialize screens
        initSplashScreen();
        const gameComponents = initGameScreen();
        
        // Store game components
        this.gameState.words = gameComponents.words;
        
        // Set game as active
        this.gameState.active = true;
        
        // Start game loop
        this.startGameLoop();
    }
    
    startGameLoop() {
        // Simple game loop for future expansion
        const loop = () => {
            if (this.gameState.active) {
                // Update game state here
                
                // Request next frame
                requestAnimationFrame(loop);
            }
        };
        
        // Start the loop
        requestAnimationFrame(loop);
    }
}