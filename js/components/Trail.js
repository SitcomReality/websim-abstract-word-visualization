import { TRAIL_DURATION } from 'config/constants.js';

export function createTrail(x, y, sourceElement, container, color) {
    const trail = document.createElement('div');
    trail.classList.add('trail');
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    
    // Random size between 5-15px
    const size = 5 + Math.random() * 10;
    trail.style.width = `${size}px`;
    trail.style.height = `${size}px`;
    
    // Use provided color or extract from source element
    if (color) {
        trail.style.background = color;
        trail.style.opacity = '0.7';
    } else {
        trail.style.background = window.getComputedStyle(sourceElement).background;
    }
    
    container.appendChild(trail);
    
    // Remove trail element after animation
    setTimeout(() => {
        if (container.contains(trail)) {
            container.removeChild(trail);
        }
    }, TRAIL_DURATION);
}