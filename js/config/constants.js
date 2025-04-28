export const COLORS = {
    SMORMA: {
        primary: '#ff5722',
        secondary: '#e91e63'
    },
    PIPS: {
        primary: '#9c27b0',
        secondary: '#673ab7'
    },
    TINE: {
        primary: '#2196f3',
        secondary: '#03a9f4'
    },
    ELUSIVE: {
        primary: '#009688',
        secondary: '#4caf50'
    },
    PARADIASTOLIC: {
        primary: '#ffc107',
        secondary: '#ff9800'
    },
    PERIHELION: {
        primary: '#f44336',
        secondary: '#b71c1c'
    },
    SCOLFLOCS: {
        primary: '#3f51b5',
        secondary: '#1a237e'
    },
    HYPERBOLIC: {
        primary: '#607d8b',
        secondary: '#263238'
    }
};

export const SIZES = {
    SMORMA: 120,
    PIPS: 80,
    TINE: 90,
    ELUSIVE: 130,
    PARADIASTOLIC: 150,
    PERIHELION: 110,
    SCOLFLOCS: 140,
    HYPERBOLIC: 125
};

export const WORDS_DATA = [
    { id: 'smorma', text: 'Smorma pips', size: SIZES.SMORMA, colors: COLORS.SMORMA, energyPotential: 10 },
    { id: 'pips', text: 'Pips', size: SIZES.PIPS, colors: COLORS.PIPS, energyPotential: 5 },
    { id: 'tine', text: 'Tine', size: SIZES.TINE, colors: COLORS.TINE, energyPotential: 7 },
    { id: 'elusive', text: 'Elusive allusion', size: SIZES.ELUSIVE, colors: COLORS.ELUSIVE, energyPotential: 12 },
    { id: 'paradiastolic', text: 'Paradiastolic clotting', size: SIZES.PARADIASTOLIC, colors: COLORS.PARADIASTOLIC, energyPotential: 15 },
    { id: 'perihelion', text: 'Perihelion torsion', size: SIZES.PERIHELION, colors: COLORS.PERIHELION, energyPotential: 11 },
    { id: 'scolflocs', text: 'Scolflocs periporter', size: SIZES.SCOLFLOCS, colors: COLORS.SCOLFLOCS, energyPotential: 14 },
    { id: 'hyperbolic', text: 'Hyperbolic lenity', size: SIZES.HYPERBOLIC, colors: COLORS.HYPERBOLIC, energyPotential: 13 }
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