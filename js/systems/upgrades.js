import { UPGRADE_DEFINITIONS } from './upgrades/upgradeDefinitions.js';

export class UpgradeSystem {
    constructor(engine) {
        this.engine = engine;
        this.currentLevels = {};
        UPGRADE_DEFINITIONS.forEach(upgrade => {
            this.currentLevels[upgrade.id] = 0;
        });
        this.definitions = UPGRADE_DEFINITIONS;
    }

    static get UPGRADE_DEFINITIONS() {
        return UPGRADE_DEFINITIONS;
    }

    applyUpgrade(itemId) {
        const item = this.definitions.find(i => i.id === itemId);
        if (!item) return;
        const currentLevel = this.currentLevels[itemId] || 0;
        if (currentLevel >= item.maxLevel) return;
        const newLevel = currentLevel + 1;
        this.currentLevels[itemId] = newLevel;
        if (typeof item.applyEffect === 'function') {
            item.applyEffect(this.engine, newLevel);
        }
    }

    initializeWordBaseStats() {
        this.engine.gameState.words.forEach(word => {
            if (word.baseEnergyPotential === undefined) {
                word.baseEnergyPotential = word.energyPotential;
            }
            if (word.physics && word.physics.baseRestitution === undefined) {
                word.physics.baseRestitution = word.restitution;
            }
        });
        if (this.engine.resonanceSystem) {
            for (const type in this.engine.resonanceSystem.chainTypes) {
                const chainType = this.engine.resonanceSystem.chainTypes[type];
                if (chainType.baseMultiplier === undefined) {
                    chainType.baseMultiplier = chainType.multiplier;
                }
            }
            if (this.engine.resonanceSystem.baseChainDecayTime === undefined) {
                this.engine.resonanceSystem.baseChainDecayTime = this.engine.resonanceSystem.chainDecayTime;
            }
        }
    }

    resetUpgrades() {
        Object.keys(this.currentLevels).forEach(id => {
            this.currentLevels[id] = 0;
        });

        this.engine.gameState.chromaticBlindnessColor = null;
        this.engine.gameState.quantumUncertaintyActive = false;
        this.engine.gameState.skepticalMethodActive = false;
        this.engine.gameState.deterministicUniverseActive = false;
        this.engine.gameState.eternalismActive = false;
        this.engine.gameState.categoricalImperativeActive = false;
        this.engine.gameState.nihilisticVoidActive = false;
        this.engine.gameState.categoricalSequence = null;
        this.engine.gameState.holistVisionActive = false;
        this.engine.gameState.reductionistToolkitActive = false;
        this.engine.stopNihilisticVoidTimer();

        this.engine.gameState.words.forEach(word => {
            if (word && typeof word.removeDoubleClickListener === 'function') {
                word.removeDoubleClickListener();
            }
        });

        this.engine.physics.collisionEnergyMultiplier = 1.0;
        this.engine.fusionSuccessRateModifier = 1.0;

        if (this.engine.resonanceSystem) {
            for (const type in this.engine.resonanceSystem.chainTypes) {
                const chainType = this.engine.resonanceSystem.chainTypes[type];
                if (chainType.baseMultiplier !== undefined) {
                    chainType.multiplier = chainType.baseMultiplier;
                }
            }
            if (this.engine.resonanceSystem.baseChainDecayTime !== undefined) {
                this.engine.resonanceSystem.chainDecayTime = this.engine.resonanceSystem.baseChainDecayTime;
            }
        }

        this.engine.gameState.words.forEach(word => {
            if (word.baseEnergyPotential !== undefined) {
                word.energyPotential = word.baseEnergyPotential;
            }
            if (word.physics?.baseRestitution !== undefined) {
                word.restitution = word.physics.baseRestitution;
            }
            word.updateVisibility();
        });
    }
}