import { createExplosion } from 'effects/explosion.js';
import { createSpiral } from 'effects/spiral.js';
import { createWave } from 'effects/wave.js';
import { createFadeEffect } from 'effects/fade.js';
import { createPulse } from 'effects/pulse.js';
import { createOrbit } from 'effects/orbit.js';
import { createRain } from 'effects/rain.js';
import { createHyperEffect } from 'effects/hyper.js';
import { EFFECT_SETTINGS } from 'config/constants.js';

export function createSpecialEffect(id, x, y, color, count) {
    let particleCount = count || 10;
    
    switch(id) {
        case 'smorma':
            createExplosion(x, y, color, EFFECT_SETTINGS.EXPLOSION.particleCount);
            break;
        case 'pips':
            createSpiral(x, y, color, EFFECT_SETTINGS.SPIRAL.particleCount);
            break;
        case 'tine':
            createWave(x, y, color, EFFECT_SETTINGS.WAVE.waveCount);
            break;
        case 'elusive':
            createFadeEffect(x, y, color, EFFECT_SETTINGS.FADE.particleCount);
            break;
        case 'paradiastolic':
            createPulse(x, y, color, EFFECT_SETTINGS.PULSE.pulseCount);
            break;
        case 'perihelion':
            createOrbit(x, y, color, EFFECT_SETTINGS.ORBIT.orbiterCount);
            break;
        case 'scolflocs':
            createRain(x, y, color, EFFECT_SETTINGS.RAIN.dropCount);
            break;
        case 'hyperbolic':
            createHyperEffect(x, y, color, EFFECT_SETTINGS.HYPER.particleCount);
            break;
        case 'fusion':
            // Special fusion effect combines multiple effects
            createExplosion(x, y, color, particleCount / 2);
            createWave(x, y, color, 3);
            createPulse(x, y, color, 3);
            break;
        default:
            createExplosion(x, y, '#ffffff', 10);
    }
}