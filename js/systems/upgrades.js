import { PHYSICS_CONFIG } from 'config/constants.js';
import { COLORS } from 'config/constants.js'; // Import COLORS

export class UpgradeSystem {
    constructor(engine) {
        this.engine = engine;
        this.currentLevels = {}; // Store current level of each upgrade centrally
        UpgradeSystem.UPGRADE_DEFINITIONS.forEach(upgrade => {
            this.currentLevels[upgrade.id] = 0;
        });
        console.log("Upgrade System Initialized with levels:", this.currentLevels);
    }

    // Define upgrade types and their effects
    // Static definition remains, used by ShopSystem and UpgradeSystem instance
    static UPGRADE_DEFINITIONS = [
        // --- Existing Upgrades (modified for consistency) ---
        {
            id: 'energy_boost',
            name: 'Energy Surge',
            description: 'Increases base energy gained per word activation.',
            cost: 25,
            maxLevel: 5,
            applyEffect: (engine, level) => {
                console.log(`Applying Energy Surge Level ${level}`);
                engine.gameState.words.forEach(word => {
                    // Ensure base potential exists before modifying
                    if (word.baseEnergyPotential === undefined) word.baseEnergyPotential = word.energyPotential;
                    word.energyPotential = word.baseEnergyPotential * Math.pow(1.15, level); // 15% increase per level
                });
            }
        },
        {
            id: 'collision_power',
            name: 'Kinetic Amplifier',
            description: 'Increases energy generated from collisions.',
            cost: 50,
            maxLevel: 3,
            applyEffect: (engine, level) => {
                console.log(`Applying Kinetic Amplifier Level ${level}`);
                engine.physics.collisionEnergyMultiplier = 1 + level * 0.75; // Stronger effect: +75% per level
            }
        },
        {
            id: 'fusion_chance',
            name: 'Lexical Affinity',
            description: 'Increases the chance of successful word fusion.',
            cost: 100,
            maxLevel: 4,
            applyEffect: (engine, level) => {
                console.log(`Applying Lexical Affinity Level ${level}`);
                engine.fusionSuccessRateModifier = 1 + level * 0.2; // +20% chance per level
            }
        },
        {
            id: 'physics_restitution',
            name: 'Elasticity Enhancement',
            description: 'Makes words bouncier.',
            cost: 40,
            maxLevel: 3,
            applyEffect: (engine, level) => {
                console.log(`Applying Elasticity Enhancement Level ${level}`);
                const baseRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0]; // Original base
                const increasePerLevel = 0.05; // Increase max restitution per level
                const maxRestitution = Math.min(0.99, PHYSICS_CONFIG.RESTITUTION_RANGE[1] + level * increasePerLevel);

                engine.gameState.words.forEach(word => {
                    // Recalculate restitution based on new potential range
                    // Restore base first if it exists
                    const originalBase = word.behavior?.baseRestitution || baseRestitution;
                    const randomFactor = Math.random() * (maxRestitution - originalBase);
                    word.restitution = Math.min(maxRestitution, originalBase + randomFactor);
                });
            }
        },
        {
            id: 'resonance_duration',
            name: 'Harmonic Resonator',
            description: 'Extends the duration of resonance chains.',
            cost: 75,
            maxLevel: 3,
            applyEffect: (engine, level) => {
                if (engine.resonanceSystem) {
                    const baseDuration = engine.resonanceSystem.baseChainDecayTime || 6000;
                    engine.resonanceSystem.chainDecayTime = baseDuration + (level * 2500); // +2.5s per level
                }
            }
        },
        {
            id: 'resonance_power',
            name: 'Resonance Amplifier',
            description: 'Increases the power of resonance chain multipliers.',
            cost: 90,
            maxLevel: 3,
            applyEffect: (engine, level) => {
                if (engine.resonanceSystem) {
                    const increase = level * 0.3; // +0.3 base multiplier per level
                    for (const type in engine.resonanceSystem.chainTypes) {
                        const chainType = engine.resonanceSystem.chainTypes[type];
                        // Assume base multiplier is stored somewhere or calculate from initial state
                        const baseMultiplier = chainType.baseMultiplier || chainType.multiplier; // Need to store baseMultiplier on init
                        chainType.multiplier = baseMultiplier + increase;
                    }
                }
            }
        },
        // --- GDD Transformative / Constraint Upgrades ---
        {
            id: 'chromatic_blindness_red',
            name: 'Chromatic Blindness (Red)',
            description: 'Cannot interact with Red/Orange (Rationalism) spheres. Other spheres generate 2x energy.',
            cost: 150,
            maxLevel: 1, // One-time purchase
            applyEffect: (engine, level) => {
                if (level === 1) {
                    console.log("Applying Chromatic Blindness (Red)");
                    engine.gameState.chromaticBlindnessColor = 'Rationalism'; // Store the affected school name
                    // Re-evaluate visibility of all words
                    engine.gameState.words.forEach(word => word.updateVisibility());
                    // Note: The 2x energy effect needs to be applied in WordBehavior.activate
                }
            }
        },
         {
            id: 'chromatic_blindness_blue',
            name: 'Chromatic Blindness (Blue)',
            description: 'Cannot interact with Blue/Green (Empiricism) spheres. Other spheres generate 2x energy.',
            cost: 150,
            maxLevel: 1,
            applyEffect: (engine, level) => {
                 if (level === 1) {
                    console.log("Applying Chromatic Blindness (Blue)");
                    engine.gameState.chromaticBlindnessColor = 'Empiricism';
                    engine.gameState.words.forEach(word => word.updateVisibility());
                }
            }
        },
        {
            id: 'quantum_uncertainty',
            name: 'Quantum Uncertainty',
            description: 'Spheres randomly teleport short distances when not observed (cursor not hovering). Each teleport has a 20% chance to grant 5 energy.',
            cost: 200,
            maxLevel: 1,
            applyEffect: (engine, level) => {
                 if (level === 1) {
                    console.log("Applying Quantum Uncertainty");
                    engine.gameState.quantumUncertaintyActive = true;
                    // Logic applied in WordBehavior.updatePhysics
                }
            }
        },
        {
            id: 'skeptical_method',
            name: 'Skeptical Method',
            description: '30% chance for any activation to fail (no energy/effect). Successful activations have 3x energy potential.',
            cost: 180,
            maxLevel: 1,
            applyEffect: (engine, level) => {
                if (level === 1) {
                    console.log("Applying Skeptical Method");
                    engine.gameState.skepticalMethodActive = true;
                    // Logic applied in WordBehavior.activate
                }
            }
        },
        {
            id: 'deterministic_universe',
            name: 'Deterministic Universe',
            description: 'Spheres follow fixed paths after being set in motion (no random movement, stop on collision/boundary). Collisions are predictable.',
            cost: 120,
            maxLevel: 1,
            applyEffect: (engine, level) => {
                 if (level === 1) {
                    console.log("Applying Deterministic Universe");
                    engine.gameState.deterministicUniverseActive = true;
                    // Stop random push force and modify collision response in WordBehavior/Physics
                     engine.gameState.words.forEach(word => {
                         word.vx = 0; // Stop existing motion to fit theme
                         word.vy = 0;
                     });
                }
            }
        },
    ];

    // Apply an upgrade by ID
    applyUpgrade(itemId) {
        const item = UpgradeSystem.UPGRADE_DEFINITIONS.find(i => i.id === itemId);
        if (!item) {
            console.warn(`Upgrade definition not found for ID: ${itemId}`);
            return;
        }

        const currentLevel = this.currentLevels[itemId] || 0;
        if (currentLevel >= item.maxLevel) {
            console.warn(`Upgrade ${itemId} is already at max level.`);
            return;
        }

        const newLevel = currentLevel + 1;
        this.currentLevels[itemId] = newLevel; // Update central level tracking

        if (typeof item.applyEffect === 'function') {
            item.applyEffect(this.engine, newLevel);
            console.log(`Successfully applied upgrade '${item.name}' to Level ${newLevel}`);
        } else {
            console.warn(`Could not apply effect for upgrade ID: ${item.id}. Effect function missing.`);
        }
    }


    // Initialize base values before applying upgrades
    initializeWordBaseStats() {
        this.engine.gameState.words.forEach(word => {
             // Store base potential if not already stored
             if (word.baseEnergyPotential === undefined) {
                 word.baseEnergyPotential = word.energyPotential;
             }
             // Store base restitution if needed by upgrades
             if (word.behavior && word.behavior.baseRestitution === undefined) {
                 word.behavior.baseRestitution = word.restitution;
             }
         });
         // Store base resonance multipliers if needed
         if (this.engine.resonanceSystem) {
             for (const type in this.engine.resonanceSystem.chainTypes) {
                 const chainType = this.engine.resonanceSystem.chainTypes[type];
                 if (chainType.baseMultiplier === undefined) {
                    chainType.baseMultiplier = chainType.multiplier;
                 }
             }
             if(this.engine.resonanceSystem.baseChainDecayTime === undefined) {
                 this.engine.resonanceSystem.baseChainDecayTime = this.engine.resonanceSystem.chainDecayTime;
             }
         }
    }

     // Reset upgrades (e.g., for a new game run in roguelike mode)
     resetUpgrades() {
         console.log("Resetting all upgrades...");
         // Reset tracked levels
         Object.keys(this.currentLevels).forEach(id => {
             this.currentLevels[id] = 0;
         });

         // Reset engine state flags modified by upgrades
         this.engine.gameState.chromaticBlindnessColor = null;
         this.engine.gameState.quantumUncertaintyActive = false;
         this.engine.gameState.skepticalMethodActive = false;
         this.engine.gameState.deterministicUniverseActive = false;

         // Reset multipliers or effects applied by upgrades
         this.engine.physics.collisionEnergyMultiplier = 1.0;
         this.engine.fusionSuccessRateModifier = 1.0;

         // Reset resonance system values to base
         if (this.engine.resonanceSystem) {
             for (const type in this.engine.resonanceSystem.chainTypes) {
                 const chainType = this.engine.resonanceSystem.chainTypes[type];
                 if (chainType.baseMultiplier !== undefined) {
                    chainType.multiplier = chainType.baseMultiplier;
                 }
             }
             if(this.engine.resonanceSystem.baseChainDecayTime !== undefined) {
                this.engine.resonanceSystem.chainDecayTime = this.engine.resonanceSystem.baseChainDecayTime;
             }
         }

         // Reset word stats to base values
         this.engine.gameState.words.forEach(word => {
             if (word.baseEnergyPotential !== undefined) {
                 word.energyPotential = word.baseEnergyPotential;
             }
             if (word.behavior?.baseRestitution !== undefined) {
                word.restitution = word.behavior.baseRestitution;
             }
             word.updateVisibility(); // Ensure visibility is reset
         });
         console.log("Upgrades reset to base values.");
     }
}