import { TRAIL_DURATION } from 'config/constants.js';

export function createTrail(x, y, sourceElement, container) {
    const trail = document.createElement('div');
    trail.classList.add('trail');
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    trail.style.width = '10px';
    trail.style.height = '10px';
    trail.style.background = window.getComputedStyle(sourceElement).background;
    container.appendChild(trail);
    
    // Remove trail element after animation
    setTimeout(() => {
        if (container.contains(trail)) {
            container.removeChild(trail);
        }
    }, TRAIL_DURATION);
}