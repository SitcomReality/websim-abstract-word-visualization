export function createWave(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        const wave = document.createElement('div');
        wave.classList.add('wave');
        wave.style.left = `${x}px`;
        wave.style.top = `${y}px`;
        wave.style.width = '10px';
        wave.style.height = '10px';
        wave.style.borderRadius = '50%';
        wave.style.background = 'transparent';
        wave.style.border = `2px solid ${color}`;
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.opacity = '1';
        container.appendChild(wave);
        
        setTimeout(() => {
            wave.style.transition = `all 1.5s ease-out`;
            wave.style.width = '300px';
            wave.style.height = '300px';
            wave.style.opacity = '0';
            
            setTimeout(() => {
                if (container.contains(wave)) {
                    container.removeChild(wave);
                }
            }, 1500);
        }, i * 200);
    }
}

