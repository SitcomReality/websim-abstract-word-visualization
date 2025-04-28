export const COLORS = {
    LOGOS: {
        primary: '#ff5722',
        secondary: '#e91e63'
    },
    KAIROS: {
        primary: '#9c27b0',
        secondary: '#673ab7'
    },
    AETHER: {
        primary: '#2196f3',
        secondary: '#03a9f4'
    },
    APEIRON: {
        primary: '#009688',
        secondary: '#4caf50'
    },
    QUINTESSENCE: {
        primary: '#ffc107',
        secondary: '#ff9800'
    },
    MONAD: {
        primary: '#f44336',
        secondary: '#b71c1c'
    },
    ANIMA: {
        primary: '#3f51b5',
        secondary: '#1a237e'
    },
    ENTROPY: {
        primary: '#607d8b',
        secondary: '#263238'
    }
};

export const SIZES = {
    LOGOS: 120,
    KAIROS: 80,
    AETHER: 90,
    APEIRON: 130,
    QUINTESSENCE: 150,
    MONAD: 110,
    ANIMA: 140,
    ENTROPY: 125
};

export const WORDS_DATA = [
    { id: 'logos', text: 'Logos', size: SIZES.LOGOS, colors: COLORS.LOGOS, energyPotential: 10 },
    { id: 'kairos', text: 'Kairos', size: SIZES.KAIROS, colors: COLORS.KAIROS, energyPotential: 5 },
    { id: 'aether', text: 'Aether', size: SIZES.AETHER, colors: COLORS.AETHER, energyPotential: 7 },
    { id: 'apeiron', text: 'Apeiron', size: SIZES.APEIRON, colors: COLORS.APEIRON, energyPotential: 12 },
    { id: 'quintessence', text: 'Quintessence', size: SIZES.QUINTESSENCE, colors: COLORS.QUINTESSENCE, energyPotential: 15 },
    { id: 'monad', text: 'Monad', size: SIZES.MONAD, colors: COLORS.MONAD, energyPotential: 11 },
    { id: 'anima', text: 'Anima', size: SIZES.ANIMA, colors: COLORS.ANIMA, energyPotential: 14 },
    { id: 'entropy', text: 'Entropy', size: SIZES.ENTROPY, colors: COLORS.ENTROPY, energyPotential: 13 }
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