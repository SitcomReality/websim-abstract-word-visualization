export function createSpiral(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        
        container.appendChild(particle);
        
        const startTime = Date.now();
        const duration = 2000;
        const delay = i * 100;
        
        function animateParticle() {
            const now = Date.now();
            if (now < startTime + delay) {
                requestAnimationFrame(animateParticle);
                return;
            }
            
            const elapsed = now - (startTime + delay);
            const progress = Math.min(elapsed / duration, 1);
            
            const angle = progress * Math.PI * 10 + (i * Math.PI / count * 2);
            const radius = progress * 150;
            const opacity = 1 - progress;
            
            particle.style.left = `${x + Math.cos(angle) * radius}px`;
            particle.style.top = `${y + Math.sin(angle) * radius}px`;
            particle.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animateParticle);
            } else {
                container.removeChild(particle);
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

