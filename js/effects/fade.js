export function createFadeEffect(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = `${x + (Math.random() - 0.5) * 100}px`;
            particle.style.top = `${y + (Math.random() - 0.5) * 100}px`;
            particle.style.width = '15px';
            particle.style.height = '15px';
            particle.style.borderRadius = '50%';
            particle.style.background = color;
            particle.style.opacity = '0.8';
            particle.style.position = 'absolute';
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (container.contains(particle)) {
                    container.removeChild(particle);
                }
            }, 1000);
        }, i * 50);
    }
}

