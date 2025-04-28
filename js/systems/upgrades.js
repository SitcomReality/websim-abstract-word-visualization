import { PHYSICS_CONFIG } from 'config/constants.js';

export class UpgradeSystem {
    constructor(engine) {
        this.engine = engine;
        console.log("Upgrade System Initialized");
    }

    // Define upgrade types and their effects
    static UPGRADE_DEFINITIONS = [
        {
            id: 'energy_boost',
            name: 'Energy Surge',
            description: 'Increases base energy gained per click.',
            cost: 25,
            maxLevel: 5,
            applyEffect: (engine, level) => {
                console.log(`Applying Energy Surge Level ${level}`);
                // Example: Modify a global multiplier or iterate through words
                engine.gameState.words.forEach(word => {
                    // Increase base potential by 10% per level, compounding
                    word.energyPotential = word.baseEnergyPotential * Math.pow(1.1, level);
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
                // Example: Increase a collision energy multiplier in physics or energy manager
                // This might require adding a property to the physics or energy system
                engine.physics.collisionEnergyMultiplier = 1 + level * 0.5; // Example property
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
                // Example: Modify a global fusion chance modifier
                // This might require adding a property to the Word class or Engine
                engine.fusionSuccessRateModifier = 1 + level * 0.15; // Example property
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
                // Modify physics config or individual word properties
                const baseRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0];
                const maxRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[1];
                const increase = (maxRestitution - baseRestitution) * (level * 0.2); // Increase range slightly

                engine.gameState.words.forEach(word => {
                   // Recalculate restitution based on new potential range
                   // This is a simple example; could be more complex
                   const randomFactor = Math.random() * (maxRestitution - baseRestitution + increase);
                   word.restitution = Math.min(0.99, baseRestitution + increase + randomFactor);
                });
            }
        },
    ];

    applyUpgradeEffect(item, newLevel) {
        if (item && typeof item.applyEffect === 'function') {
            item.applyEffect(this.engine, newLevel);
            console.log(`Successfully applied upgrade '${item.name}' to Level ${newLevel}`);
        } else {
            console.warn(`Could not apply effect for upgrade ID: ${item?.id}. Effect function missing or item undefined.`);
        }
    }

    // Initialize base values before applying upgrades
    initializeWordBaseStats() {
        this.engine.gameState.words.forEach(word => {
             if (word.baseEnergyPotential === undefined) {
                 word.baseEnergyPotential = word.energyPotential;
             }
         });
         // Initialize other base stats if needed
    }

     // Reset upgrades (e.g., for a new game run in roguelike mode)
     resetUpgrades() {
         // Reset multipliers or effects applied by upgrades
         this.engine.physics.collisionEnergyMultiplier = 1.0;
         this.engine.fusionSuccessRateModifier = 1.0;
         // Reset word stats to base values
         this.engine.gameState.words.forEach(word => {
             if (word.baseEnergyPotential !== undefined) {
                 word.energyPotential = word.baseEnergyPotential;
             }
             // Reset other stats like restitution if modified directly
         });
         console.log("Upgrades reset to base values.");
     }
}