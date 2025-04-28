import { PHYSICS_CONFIG } from 'config/constants.js';
import { COLORS } from 'config/constants.js';

// Individual upgrade definition objects.
export const UPGRADE_DEFINITIONS = [
    {
        id: 'energy_boost',
        name: 'Energy Surge',
        description: 'Increases base energy gained per word activation.',
        cost: 25,
        maxLevel: 5,
        applyEffect: (engine, level) => {
            engine.gameState.words.forEach(word => {
                if (word.baseEnergyPotential === undefined) word.baseEnergyPotential = word.energyPotential;
                word.energyPotential = word.baseEnergyPotential * Math.pow(1.15, level);
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
            engine.physics.collisionEnergyMultiplier = 1 + level * 0.75;
        }
    },
    {
        id: 'fusion_chance',
        name: 'Lexical Affinity',
        description: 'Increases the chance of successful word fusion.',
        cost: 100,
        maxLevel: 4,
        applyEffect: (engine, level) => {
            engine.fusionSuccessRateModifier = 1 + level * 0.2;
        }
    },
    {
        id: 'physics_restitution',
        name: 'Elasticity Enhancement',
        description: 'Makes words bouncier.',
        cost: 40,
        maxLevel: 3,
        applyEffect: (engine, level) => {
            const baseRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0];
            const increasePerLevel = 0.05;
            const maxRestitution = Math.min(0.99, PHYSICS_CONFIG.RESTITUTION_RANGE[1] + level * increasePerLevel);

            engine.gameState.words.forEach(word => {
                const originalBase = word.physics?.baseRestitution || baseRestitution;
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
                engine.resonanceSystem.chainDecayTime = baseDuration + (level * 2500);
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
                const increase = level * 0.3;
                for (const type in engine.resonanceSystem.chainTypes) {
                    const chainType = engine.resonanceSystem.chainTypes[type];
                    const baseMultiplier = chainType.baseMultiplier || chainType.multiplier;
                    chainType.multiplier = baseMultiplier + increase;
                }
            }
        }
    },
    // Constraints/Transformative upgrades
    {
        id: 'chromatic_blindness_red',
        name: 'Chromatic Blindness (Red)',
        description: 'Cannot interact with Red/Orange (Rationalism) spheres. Other spheres generate 4x energy.',
        cost: 150,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.chromaticBlindnessColor = 'Rationalism';
                engine.gameState.words.forEach(word => word.updateVisibility());
            }
        }
    },
    {
        id: 'chromatic_blindness_blue',
        name: 'Chromatic Blindness (Blue)',
        description: 'Cannot interact with Blue/Green (Empiricism) spheres. Other spheres generate 4x energy.',
        cost: 150,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
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
                engine.gameState.quantumUncertaintyActive = true;
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
                engine.gameState.skepticalMethodActive = true;
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
                engine.gameState.deterministicUniverseActive = true;
                engine.gameState.words.forEach(word => {
                    word.vx = 0;
                    word.vy = 0;
                });
            }
        }
    },
    {
        id: 'eternalism',
        name: 'Eternalism',
        description: 'Time effects are eliminated. All cooldowns are removed, but energy generation is reduced by 40%.',
        cost: 130,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.eternalismActive = true;
            }
        }
    },
    {
        id: 'categorical_imperative',
        name: 'Categorical Imperative',
        description: 'Must activate spheres in strict size order (Micro→Meso→Macro). Completed sequences grant massive (3x) energy bonuses.',
        cost: 175,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.categoricalImperativeActive = true;
                engine.gameState.categoricalSequence = {
                    stepsComplete: 0,
                    categories: ['Micro', 'Meso', 'Macro'],
                    justCompleted: false
                };
            }
        }
    },
    {
        id: 'nihilistic_void',
        name: 'Nihilistic Void',
        description: 'Random spheres periodically disappear from existence, but each disappearance releases energy (2x potential) to nearby concepts.',
        cost: 160,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.nihilisticVoidActive = true;
                engine.startNihilisticVoidTimer();
            }
        }
    },
    {
        id: 'holist_vision',
        name: 'Holist Vision',
        description: 'Micro spheres automatically merge into Meso spheres. Individual Micro activation impossible. Fusion costs no energy.',
        cost: 140,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.holistVisionActive = true;
            }
        }
    },
    {
        id: 'reductionist_toolkit',
        name: 'Reductionist Toolkit',
        description: 'Macro spheres cannot be activated directly. Double-click any sphere to break it into 3 smaller components.',
        cost: 140,
        maxLevel: 1,
        applyEffect: (engine, level) => {
            if (level === 1) {
                engine.gameState.reductionistToolkitActive = true;
                engine.gameState.words.forEach(word => {
                    if (typeof word.addDoubleClickListener === 'function') {
                        word.addDoubleClickListener();
                    }
                });
            }
        }
    }
];