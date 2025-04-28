export function createOrbit(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        const orbitPoint = document.createElement('div');
        orbitPoint.classList.add('particle');
        orbitPoint.style.position = 'absolute';
        orbitPoint.style.width = '12px';
        orbitPoint.style.height = '12px';
        orbitPoint.style.borderRadius = '50%';
        orbitPoint.style.background = color;
        container.appendChild(orbitPoint);
        
        const angle = (i / count) * Math.PI * 2;
        const radius = 80;
        const duration = 2000;
        const startTime = Date.now();
        
        function animateOrbit() {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % duration) / duration;
            const currentAngle = angle + progress * Math.PI * 2;
            
            orbitPoint.style.left = `${x + Math.cos(currentAngle) * radius}px`;
            orbitPoint.style.top = `${y + Math.sin(currentAngle) * radius}px`;
            
            if (elapsed < 3000) {
                requestAnimationFrame(animateOrbit);
            } else {
                if (container.contains(orbitPoint)) {
                    container.removeChild(orbitPoint);
                }
            }
        }
        
        requestAnimationFrame(animateOrbit);
    }
}

