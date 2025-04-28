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
            // Attempt to proceed, but functionality might be limited
        }
         if (this.shopButton) {
            this.shopButton.addEventListener('click', () => this.showShopScreen());
        } else {
             console.warn("Shop button not found!"); // Warn instead of error
         }
        if (this.closeShopButton) {
             this.closeShopButton.addEventListener('click', () => this.showGameScreen(true)); // Resume game when closing shop
        } else {
             console.warn("Close shop button not found!"); // Warn instead of error
         }
    }

    _setActiveScreen(activeScreen) {
        [this.splashScreen, this.gameScreen, this.shopScreen].forEach(screen => {
            if (screen) {
                const isActive = screen === activeScreen;
                screen.classList.toggle('active', isActive);
                // Use visibility for potential transitions, but display none/block for layout calculation
                screen.style.display = isActive ? 'block' : 'none';
                // screen.style.visibility = isActive ? 'visible' : 'hidden';
                // screen.style.opacity = isActive ? '1' : '0';
            }
        });
        // Derive screen name from ID, fallback to 'none'
        this.engine.gameState.currentScreen = activeScreen?.id.replace('-screen', '') || 'none';
        console.log(`Switched to screen: ${this.engine.gameState.currentScreen}`);
    }

    showSplashScreen() {
        this.engine.stopGameLoop(); // Ensure game loop stops if returning to splash
        this._setActiveScreen(this.splashScreen);
    }

    showGameScreen(resumeLoop = true) {
        console.log("Attempting to show game screen. Resume loop:", resumeLoop);
        if (!this.gameScreen) {
            console.error("Game screen element not found. Cannot show game screen.");
            return;
        }

        this._setActiveScreen(this.gameScreen); // Set active FIRST

        // Ensure energy display is updated when returning to game screen
        if (this.engine.energyManager) {
            // Attempt to find the element fresh each time, in case it was dynamically added/removed
             const energyCounterElement = document.getElementById('energy-counter');
             if (energyCounterElement) {
                 this.engine.energyManager.setDisplayElement(energyCounterElement);
                 this.engine.energyManager.updateEnergyDisplay();
             } else {
                 console.warn("Energy counter element not found when trying to update display.");
             }
        } else {
            console.warn("Energy Manager not available when showing game screen.");
        }


        // Initialize game elements ONCE
        if (!this.engine.container) {
             console.log("Initializing game screen elements for the first time.");
             // Find the container within the now visible game screen
             this.engine.container = this.gameScreen.querySelector('.container');

             if (this.engine.container) {
                 // Wait for the next frame to ensure layout is calculated after display:block
                 // This helps prevent getBoundingClientRect issues if called too early
                 requestAnimationFrame(() => {
                     // Double-check container still exists in case of rapid screen changes or DOM manipulation
                     if (!this.engine.container) {
                         console.error("Container disappeared before initialization could complete.");
                         return;
                     }
                     const rect = this.engine.container.getBoundingClientRect();
                     console.log("Container dimensions for initialization:", rect.width, "x", rect.height);

                     // Check if dimensions are valid before proceeding with physics/positioning
                     if (rect.width === 0 || rect.height === 0) {
                         console.warn("Container has zero dimensions, delaying initialization slightly and trying again.");
                         // Use a small timeout as a fallback if rAF isn't enough (rare)
                         setTimeout(() => {
                             if(this.engine.container) {
                                 const rect2 = this.engine.container.getBoundingClientRect();
                                 console.log("Container dimensions (attempt 2):", rect2.width, "x", rect2.height);
                                 if(rect2.width > 0 && rect2.height > 0) {
                                     this.finishInitialization(resumeLoop);
                                 } else {
                                     console.error("Container still has zero dimensions. Cannot initialize game.");
                                 }
                             }
                         }, 50); // 50ms delay
                         return;
                     }

                     // Dimensions look valid, proceed with initialization
                     this.finishInitialization(resumeLoop);
                 });
                 // Prevent loop start until async init (rAF) completes by returning here
                 return;
             } else {
                  console.error("Game container element '.container' not found within '#game-screen'!");
                  // No point starting loop if container is missing
                  return;
             }
        } else {
            // If container already exists (e.g., returning from shop), initialization is done
            console.log("Game screen elements already initialized. Checking loop state.");
            // Start/resume game loop immediately if needed
            this.manageGameLoop(resumeLoop);
        }
    }

    // Helper function for the actual initialization steps (called after layout is ready)
    finishInitialization(resumeLoop) {
        console.log("Finishing initialization...");
        if (!this.engine.container) {
             console.error("Cannot finish initialization, container is missing.");
             return;
        }
        if (!this.engine.wordManager || !this.engine.physics || !this.engine.energyManager) {
            console.error("Cannot finish initialization, required engine systems are missing.");
            return;
        }

        // Ensure energy display is set and updated again, just in case
        const energyCounterElement = document.getElementById('energy-counter');
        if (energyCounterElement) {
            this.engine.energyManager.setDisplayElement(energyCounterElement);
            this.engine.energyManager.updateEnergyDisplay();
        }

        this.engine.wordManager.initializeWords(this.engine.container);
        this.engine.physics.resolveInitialOverlaps(this.engine.gameState.words, this.engine.container);
        console.log("Game initialization complete.");

        // Start/resume game loop only after initialization is done
        this.manageGameLoop(resumeLoop);
    }

    // Helper function to manage starting/stopping the loop
    manageGameLoop(shouldBeActive) {
        if (shouldBeActive && !this.engine.gameState.active) {
             console.log("Starting game loop.");
             this.engine.startGameLoop();
        } else if (!shouldBeActive && this.engine.gameState.active) {
             console.log("Stopping game loop.");
             this.engine.stopGameLoop();
        } else {
            // Loop state already matches desired state
            // console.log(`Loop state unchanged: shouldBeActive=${shouldBeActive}, currently active=${this.engine.gameState.active}`);
        }
    }


    showShopScreen() {
        console.log("Attempting to show shop screen.");
        if (!this.shopScreen) {
            console.error("Shop screen element not found. Cannot show shop.");
            return;
        }
        if (!this.engine.shopSystem) {
            console.error("Shop System not available. Cannot show shop.");
            return;
        }


        this.engine.stopGameLoop(); // Pause game physics while shop is open
        this._setActiveScreen(this.shopScreen);

        // Populate shop items using ShopSystem
        this.engine.shopSystem.renderShopItems();
    }
}