export function createPulse(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const pulse = document.createElement('div');
            pulse.classList.add('particle');
            pulse.style.position = 'absolute';
            pulse.style.left = `${x}px`;
            pulse.style.top = `${y}px`;
            pulse.style.width = '20px';
            pulse.style.height = '20px';
            pulse.style.borderRadius = '50%';
            pulse.style.background = color;
            pulse.style.transform = 'translate(-50%, -50%)';
            pulse.style.opacity = '0.7';
            container.appendChild(pulse);
            
            pulse.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.7 },
                { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
            ], { 
                duration: 1000,
                easing: 'ease-out'
            });
            
            setTimeout(() => {
                if (container.contains(pulse)) {
                    container.removeChild(pulse);
                }
            }, 1000);
        }, i * 100);
    }
}

