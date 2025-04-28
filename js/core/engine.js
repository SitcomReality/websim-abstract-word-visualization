import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';
import { PHYSICS_CONFIG } from 'config/constants.js';
import { ScreenManager } from 'core/screenManager.js';
import { Physics } from 'core/physics.js';
import { ShopSystem } from 'systems/shop.js';
import { EnergyManager } from 'systems/energy.js';
import { WordManager } from 'systems/wordManager.js';
import { UpgradeSystem } from 'systems/upgrades.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false
        };
        this.lastTimestamp = 0;
        this.container = null;
        // Add properties for global modifiers if needed by upgrades
        this.fusionSuccessRateModifier = 1.0;

        // Initialize Managers and Systems
        this.screenManager = new ScreenManager(this);
        this.physics = new Physics(this); // Pass engine instance
        // Initialize physics-related upgradeable properties
        this.physics.collisionEnergyMultiplier = 1.0;
        this.energyManager = new EnergyManager(this, 0, null);
        this.shopSystem = new ShopSystem(this);
        this.wordManager = new WordManager(this);
        this.upgradeSystem = new UpgradeSystem(this);

        // Collision sound related properties - moved potentially to an AudioManager later
        this.collisionSounds = {
            light: new Audio(),
            medium: new Audio(),
            heavy: new Audio()
        };
        this.lastCollisionTime = 0;
        this.collisionCooldown = PHYSICS_CONFIG.COLLISION_COOLDOWN; // Maybe move to Physics?
    }

    init() {
        // Initialize Splash Screen, passing the ScreenManager's method
        initSplashScreen(this.screenManager.showGameScreen.bind(this.screenManager));
        // Initialize Shop System (fetches elements, sets up listeners)
        this.shopSystem.initShop();
    }

    startGameLoop() {
        if (this.gameState.active) { // Prevent multiple loops if already active
             console.warn("Game loop already started.");
             return;
        }
        // Initialize base word stats before starting loop / applying upgrades
        if (this.upgradeSystem) {
            this.upgradeSystem.initializeWordBaseStats();
        }

        this.gameState.active = true;
        this.lastTimestamp = performance.now();
        console.log("Starting game loop");

        const loop = (timestamp) => {
            if (!this.gameState.active) {
                 console.log("Stopping game loop");
                 return; // Exit loop if game state is inactive
            }

            // Calculate delta time, ensuring it's not excessively large
            const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1); // Max dt 100ms
            this.lastTimestamp = timestamp;

            // Update game logic only if on the game screen and container exists
            if (this.gameState.currentScreen === 'game' && this.container) {
                this.updateGame(dt);
            }

            // Request the next frame
            requestAnimationFrame(loop);
        };

        // Start the loop
        requestAnimationFrame(loop);
    }
    
    // Delegate energy addition to the EnergyManager
    addEnergy(amount) {
        if (this.energyManager) {
            this.energyManager.addEnergy(amount);
        } else {
            console.error("EnergyManager not initialized!");
        }
    }
    
    // Getter for current energy
    get currentEnergy() {
        return this.energyManager ? this.energyManager.getEnergy() : 0;
    }

    updateGame(dt) {
        if (!this.container || !this.gameState.active) return;

        // Update word physics (movement, boundaries) via Physics module
        this.physics.updatePhysics(this.gameState.words, dt * 60, this.container); // Pass dt scaled for 60fps base

        // Handle collisions via Physics module
        this.physics.handleCollisions(this.gameState.words, this.container);
    }

    stopGameLoop() {
        console.log("Requesting game loop stop");
        this.gameState.active = false;
    }
}