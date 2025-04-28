export function createHyperEffect(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = 5 + Math.random() * 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.background = color;
        particle.style.position = 'absolute';
        container.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const duration = 1500;
        const startTime = Date.now();
        
        function animateHyper() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Hyperbolic curve
            const factor = 1 / (1 - progress * 0.9);
            const currentDistance = distance * factor;
            
            particle.style.left = `${x + Math.cos(angle) * currentDistance}px`;
            particle.style.top = `${y + Math.sin(angle) * currentDistance}px`;
            particle.style.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animateHyper);
            } else {
                if (container.contains(particle)) {
                    container.removeChild(particle);
                }
            }
        }
        
        requestAnimationFrame(animateHyper);
    }
}

