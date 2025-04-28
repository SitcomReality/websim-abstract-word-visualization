import { initGameScreen } from 'screens/game.js';

export class ScreenManager {
    constructor(engine) {
        this.engine = engine;
        this.splashScreen = document.getElementById('splash-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.shopScreen = document.getElementById('shop-screen');
        this.shopButton = document.getElementById('shop-button');
        this.closeShopButton = document.getElementById('close-shop');

        if (!this.splashScreen || !this.gameScreen || !this.shopScreen) {
            console.error("One or more screen elements are missing!");
        }
         if (this.shopButton) {
            this.shopButton.addEventListener('click', () => this.showShopScreen());
        } else {
             console.error("Shop button not found!");
         }
        if (this.closeShopButton) {
             this.closeShopButton.addEventListener('click', () => this.showGameScreen(true)); // Resume game when closing shop
        } else {
             console.error("Close shop button not found!");
         }
    }

    _setActiveScreen(activeScreen) {
        [this.splashScreen, this.gameScreen, this.shopScreen].forEach(screen => {
            if (screen) {
                screen.classList.toggle('active', screen === activeScreen);
                // Ensure inactive screens are not displayed, useful for transitions/opacity
                screen.style.display = screen === activeScreen ? 'block' : 'none';
            }
        });
        this.engine.gameState.currentScreen = activeScreen?.id.replace('-screen', '') || 'none';
        console.log(`Switched to screen: ${this.engine.gameState.currentScreen}`);
    }

    showSplashScreen() {
        this.engine.stopGameLoop(); // Ensure game loop stops if returning to splash
        this._setActiveScreen(this.splashScreen);
    }

    showGameScreen(resumeLoop = true) {
        console.log("Attempting to show game screen. Resume loop:", resumeLoop);
        if (!this.gameScreen) return;

        this._setActiveScreen(this.gameScreen);

        // If switching TO game screen, initialize components if needed and start loop
        if (!this.engine.container) { // Initialize game only once
             console.log("Initializing game screen elements");
             this.engine.container = this.gameScreen.querySelector('.container');
             this.engine.energyManager.setDisplayElement(document.getElementById('energy-counter'));
             this.engine.energyManager.updateEnergyDisplay(); // Initial display

             if (this.engine.container) {
                 // Initialize game words via WordManager
                 this.engine.wordManager.initializeWords(this.engine.container);
                 // Resolve initial overlaps via Physics
                 this.engine.physics.resolveInitialOverlaps(this.engine.gameState.words, this.engine.container);
             } else {
                  console.error("Game container not found within game screen!");
                  return; // Critical error, cannot proceed
             }
        }

        if (resumeLoop && !this.engine.gameState.active) {
             this.engine.startGameLoop();
        } else if (!resumeLoop) {
             this.engine.stopGameLoop();
        }
    }

    showShopScreen() {
        console.log("Attempting to show shop screen.");
        if (!this.shopScreen) return;

        this.engine.stopGameLoop(); // Pause game physics while shop is open
        this._setActiveScreen(this.shopScreen);

        // Populate shop items using ShopSystem
        this.engine.shopSystem.renderShopItems();
    }
}