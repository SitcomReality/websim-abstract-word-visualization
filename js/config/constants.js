export const COLORS = {
    // Epistemological Schools
    RATIONALISM: { primary: '#f44336', secondary: '#ff5722' }, // Logos, Monad (Red/Orange)
    EMPIRICISM: { primary: '#2196f3', secondary: '#009688' }, // Aether, Apeiron (Blue/Green)
    IDEALISM: { primary: '#9c27b0', secondary: '#3f51b5' }, // Kairos, Anima (Purple/Pink/Indigo)
    MATERIALISM: { primary: '#ffc107', secondary: '#607d8b' } // Quintessence, Entropy (Yellow/Brown/Grey)
};

export const SIZES = {
    // Ontological Categories
    MICRO: 80, // Kairos
    MESO_SMALL: 90, // Aether
    MESO_MEDIUM: 110, // Monad
    MESO_LARGE: 120, // Logos
    MACRO_SMALL: 125, // Entropy
    MACRO_MEDIUM: 130, // Apeiron
    MACRO_LARGE: 140, // Anima
    MACRO_HUGE: 150 // Quintessence
};

export const WORDS_DATA = [
    // Rationalism (Red/Orange)
    {
        id: 'logos', text: 'Logos', size: SIZES.MESO_LARGE, colors: COLORS.RATIONALISM, energyPotential: 10,
        ontologicalCategory: 'Meso', epistemologicalSchool: 'Rationalism', methodologicalApproach: 'Analytical'
    },
    {
        id: 'monad', text: 'Monad', size: SIZES.MESO_MEDIUM, colors: COLORS.RATIONALISM, energyPotential: 11,
        ontologicalCategory: 'Meso', epistemologicalSchool: 'Rationalism', methodologicalApproach: 'Synthetic'
    },
    // Empiricism (Blue/Green)
    {
        id: 'aether', text: 'Aether', size: SIZES.MESO_SMALL, colors: COLORS.EMPIRICISM, energyPotential: 7,
        ontologicalCategory: 'Meso', epistemologicalSchool: 'Empiricism', methodologicalApproach: 'Hermeneutic'
    },
    {
        id: 'apeiron', text: 'Apeiron', size: SIZES.MACRO_MEDIUM, colors: COLORS.EMPIRICISM, energyPotential: 12,
        ontologicalCategory: 'Macro', epistemologicalSchool: 'Empiricism', methodologicalApproach: 'Dialectic'
    },
    // Idealism (Purple/Pink/Indigo)
    {
        id: 'kairos', text: 'Kairos', size: SIZES.MICRO, colors: COLORS.IDEALISM, energyPotential: 5,
        ontologicalCategory: 'Micro', epistemologicalSchool: 'Idealism', methodologicalApproach: 'Hermeneutic'
    },
    {
        id: 'anima', text: 'Anima', size: SIZES.MACRO_LARGE, colors: COLORS.IDEALISM, energyPotential: 14,
        ontologicalCategory: 'Macro', epistemologicalSchool: 'Idealism', methodologicalApproach: 'Synthetic'
    },
    // Materialism (Yellow/Brown/Grey)
    {
        id: 'quintessence', text: 'Quintessence', size: SIZES.MACRO_HUGE, colors: COLORS.MATERIALISM, energyPotential: 15,
        ontologicalCategory: 'Macro', epistemologicalSchool: 'Materialism', methodologicalApproach: 'Synthetic'
    },
    {
        id: 'entropy', text: 'Entropy', size: SIZES.MACRO_SMALL, colors: COLORS.MATERIALISM, energyPotential: 13,
        ontologicalCategory: 'Macro', epistemologicalSchool: 'Materialism', methodologicalApproach: 'Analytical'
    }
];

export const EFFECT_SETTINGS = {
    EXPLOSION: { particleCount: 20 },
    SPIRAL: { particleCount: 15 },
    WAVE: { waveCount: 10 },
    FADE: { particleCount: 25 },
    PULSE: { pulseCount: 20 },
    ORBIT: { orbiterCount: 8 },
    RAIN: { dropCount: 30 },
    HYPER: { particleCount: 15 }
};

export const ANIMATION_DURATION = 3000;
export const TRAIL_DURATION = 800; 
export const PHYSICS_CONFIG = {
    DAMPING: 0.98,
    MIN_SPEED: 0.01,
    MAX_SPEED: 4,
    PUSH_FORCE: 0.1,
    RESTITUTION_RANGE: [0.75, 0.9],
    DRAG_THROW_FACTOR: 0.8,
    COLLISION_COOLDOWN: 50  
};