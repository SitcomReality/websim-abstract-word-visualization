import { initSplashScreen } from 'screens/splash.js';
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
            tutorialStep: 0,
            discoveredConcepts: [],
            deterministicUniverseActive: false,
            quantumUncertaintyActive: false,
            skepticalMethodActive: false,
            chromaticBlindnessColor: null,
            holistVisionActive: false,
            reductionistToolkitActive: false,
            pragmaticFrameworkActive: false,
        };
        this.lastTimestamp = 0;
        this.container = null;
        this.fusionSuccessRateModifier = 1.0;

        this.screenManager = new ScreenManager(this);
        this.physics = new Physics(this);
        this.physics.collisionEnergyMultiplier = 1.0;
        this.energyManager = new EnergyManager(this, 0, null);
        this.shopSystem = new ShopSystem(this);
        this.wordManager = new WordManager(this);
        this.upgradeSystem = new UpgradeSystem(this);
        this.fusionSystem = new FusionSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        this.resonanceSystem = new ResonanceSystem(this);
        this.comboSystem = new ComboSystem(this);

        this.collisionSounds = {
            light: new Audio(),
            medium: new Audio(),
            heavy: new Audio()
        };
        this.lastCollisionTime = 0;
        this.tutorialHintElement = null;
    }

    init() {
        initSplashScreen(this.screenManager.showGameScreen.bind(this.screenManager));
        this.shopSystem.initShop();
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
        if (this.gameState.active) {
            console.warn("Game loop already started.");
            return;
        }
        if (this.upgradeSystem) {
            if (this.gameState.words.length > 0) {
                this.upgradeSystem.initializeWordBaseStats();
            } else {
                console.warn("Attempted to initialize word stats before words were created.");
            }
        }

        this.gameState.active = true;
        this.lastTimestamp = performance.now();
        console.log("Starting game loop");

        if (this.gameState.tutorialStep === 0) {
            setTimeout(() => {
                this.showTutorialHint("Welcome! Click on the philosophical spheres to harvest energy.");
            }, 1000);
        }

        const loop = (timestamp) => {
            if (!this.gameState.active) {
                console.log("Stopping game loop");
                return;
            }

            const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
            this.lastTimestamp = timestamp;

            if (this.gameState.currentScreen === 'game' && this.container) {
                this.updateGame(dt);
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    addEnergy(amount) {
        if (this.energyManager) {
            this.energyManager.addEnergy(amount);
        } else {
            console.error("EnergyManager not initialized!");
        }
    }

    get currentEnergy() {
        return this.energyManager ? this.energyManager.getEnergy() : 0;
    }

    updateGame(dt) {
        if (!this.container || !this.gameState.active || !this.gameState.words) return;

        const activeWords = this.gameState.words.filter(word => !word.isBeingDestroyed);

        activeWords.forEach(word => word.update(dt));

        this.physics.handleCollisions(activeWords, this.container);

        if (this.resonanceSystem) {
            this.resonanceSystem.updateResonanceDisplay();
            this.resonanceSystem.updateConnectionVisuals(dt);
        }

        if (Math.random() < 0.05) {
            if (this.achievementSystem) {
                this.achievementSystem.checkAchievements();
            }
        }
    }

    stopGameLoop() {
        console.log("Requesting game loop stop");
        this.gameState.active = false;
    }

    recordDiscovery(conceptId) {
        if (!this.gameState.discoveredConcepts.includes(conceptId)) {
            this.gameState.discoveredConcepts.push(conceptId);
            console.log(`New philosophical concept discovered: ${conceptId}`);

            this.showDiscoveryNotification(conceptId);

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

        notification.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1.05)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
        }).onfinish = () => {
            notification.style.opacity = '1';
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