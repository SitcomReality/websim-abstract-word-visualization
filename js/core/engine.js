import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';
import { PHYSICS_CONFIG } from 'config/constants.js';
import { ScreenManager } from 'core/screenManager.js';
import { Physics } from 'core/physics.js';
import { ShopSystem } from 'systems/shop.js';
import { EnergyManager } from 'systems/energy.js';
import { WordManager } from 'systems/wordManager.js';
import { UpgradeSystem } from 'systems/upgrades.js';
import { FusionSystem } from 'systems/fusion.js';
import { AchievementSystem } from 'systems/achievements.js';
import { ResonanceSystem } from 'systems/resonance.js';
import { ComboSystem } from 'systems/ComboSystem.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false,
            tutorialStep: 0, // Track tutorial progress
            discoveredConcepts: [] // Track discovered philosophical concepts
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
        this.fusionSystem = new FusionSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.resonanceSystem = new ResonanceSystem(this);
        this.comboSystem = new ComboSystem(this);

        // Collision sound related properties - moved potentially to an AudioManager later
        this.collisionSounds = {
            light: new Audio(),
            medium: new Audio(),
            heavy: new Audio()
        };
        this.lastCollisionTime = 0;
        this.collisionCooldown = PHYSICS_CONFIG.COLLISION_COOLDOWN; // Maybe move to Physics?

        // Tutorial system
        this.tutorialHintElement = null;
    }

    init() {
        // Initialize Splash Screen, passing the ScreenManager's method
        initSplashScreen(this.screenManager.showGameScreen.bind(this.screenManager));
        // Initialize Shop System (fetches elements, sets up listeners)
        this.shopSystem.initShop();

        // Create tutorial hint element
        this.createTutorialHintElement();
    }

    createTutorialHintElement() {
        this.tutorialHintElement = document.createElement('div');
        this.tutorialHintElement.id = 'tutorial-hint';
        this.tutorialHintElement.style.position = 'fixed';
        this.tutorialHintElement.style.bottom = '20px';
        this.tutorialHintElement.style.left = '50%';
        this.tutorialHintElement.style.transform = 'translateX(-50%)';
        this.tutorialHintElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.tutorialHintElement.style.color = 'white';
        this.tutorialHintElement.style.padding = '10px 20px';
        this.tutorialHintElement.style.borderRadius = '10px';
        this.tutorialHintElement.style.maxWidth = '80%';
        this.tutorialHintElement.style.textAlign = 'center';
        this.tutorialHintElement.style.zIndex = '1000';
        this.tutorialHintElement.style.opacity = '0';
        this.tutorialHintElement.style.transition = 'opacity 0.5s ease';
        this.tutorialHintElement.style.pointerEvents = 'none';
        document.body.appendChild(this.tutorialHintElement);
    }

    showTutorialHint(message) {
        if (!this.tutorialHintElement) return;

        this.tutorialHintElement.textContent = message;
        this.tutorialHintElement.style.opacity = '1';

        setTimeout(() => {
            this.hideTutorialHint();
        }, 6000);
    }

    hideTutorialHint() {
        if (!this.tutorialHintElement) return;
        this.tutorialHintElement.style.opacity = '0';
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

        // Initial tutorial hint
        if (this.gameState.tutorialStep === 0) {
            setTimeout(() => {
                this.showTutorialHint("Welcome! Click on the philosophical spheres to harvest energy.");
            }, 1000);
        }

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
        if (!this.container || !this.gameState.active || !this.gameState.words) return;

        // Update word physics (movement, boundaries) via Physics module
        // Filter out words being destroyed before passing to physics
        const activeWords = this.gameState.words.filter(word => !word.isBeingDestroyed);

        this.physics.updatePhysics(activeWords, dt * 60, this.container); // Pass dt scaled for 60fps base

        // Handle collisions via Physics module
        this.physics.handleCollisions(activeWords, this.container);

        // Update resonance system if it exists
        if (this.resonanceSystem) {
            this.resonanceSystem.updateResonanceDisplay(); // Updates the UI panel
            this.resonanceSystem.updateConnectionVisuals(dt); // Updates the connection lines
        }

        // Check achievements periodically
        if (Math.random() < 0.05) { // Check about once every 20 frames
            this.achievementSystem.checkAchievements();
        }
    }

    stopGameLoop() {
        console.log("Requesting game loop stop");
        this.gameState.active = false;
    }

    // Record discovered philosophical concepts
    recordDiscovery(conceptId) {
        if (!this.gameState.discoveredConcepts.includes(conceptId)) {
            this.gameState.discoveredConcepts.push(conceptId);
            console.log(`New philosophical concept discovered: ${conceptId}`);

            // Show discovery notification
            this.showDiscoveryNotification(conceptId);

            // Check for milestone achievements
            if (this.gameState.discoveredConcepts.length === 5) {
                // Could add achievement: "Philosophical Mind" - Discover 5 concepts
            }
        }
    }

    showDiscoveryNotification(conceptId) {
        const container = document.getElementById('game-screen');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = 'discovery-notification';
        notification.innerHTML = `
            <div class="discovery-icon">🔍</div>
            <div class="discovery-content">
                <div class="discovery-title">New Concept Discovered!</div>
                <div class="discovery-name">${conceptId}</div>
            </div>
        `;

        notification.style.position = 'fixed';
        notification.style.top = '30%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        notification.style.backgroundColor = 'rgba(25, 25, 35, 0.95)';
        notification.style.color = 'white';
        notification.style.padding = '20px';
        notification.style.borderRadius = '10px';
        notification.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '15px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.minWidth = '300px';
        container.appendChild(notification);

        // Animate entry
        notification.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1.05)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
        }).onfinish = () => {
             notification.style.opacity = '1'; // Ensure opacity is set after animation
             notification.style.transform = 'translate(-50%, -50%) scale(1)';
         };

        setTimeout(() => {
            notification.animate([
                { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            };
        }, 4000);
    }
}