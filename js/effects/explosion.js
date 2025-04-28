export function createExplosion(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.borderRadius = '50%';
        particle.style.background = color;
        particle.style.position = 'absolute';
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const distance = 100 + Math.random() * 150;
        
        container.appendChild(particle);
        
        const startTime = Date.now();
        const duration = 1000 + Math.random() * 1000;
        
        function animateParticle() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentDistance = distance * progress;
            const opacity = 1 - progress;
            
            particle.style.left = `${x + Math.cos(angle) * currentDistance}px`;
            particle.style.top = `${y + Math.sin(angle) * currentDistance}px`;
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

