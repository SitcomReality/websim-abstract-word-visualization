import { Engine } from 'core/engine.js';

document.addEventListener('DOMContentLoaded', () => {
    // Basic check for touch support to potentially adjust physics/interactions later
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.body.classList.toggle('touch-device', isTouchDevice);

    const engine = new Engine();
    engine.init();

    // Optional: Handle window resize
    window.addEventListener('resize', () => {
        // Could potentially reposition words or adjust boundaries if needed
        // engine.handleResize(); // Add method to engine if needed
    });
});