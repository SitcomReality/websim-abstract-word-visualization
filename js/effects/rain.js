export function createRain(x, y, color, count) {
    const container = document.querySelector('.container');
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const raindrop = document.createElement('div');
            raindrop.classList.add('particle');
            raindrop.style.position = 'absolute';
            raindrop.style.left = `${x + (Math.random() - 0.5) * 200}px`;
            raindrop.style.top = `${y - 100}px`;
            raindrop.style.width = '5px';
            raindrop.style.height = '15px';
            raindrop.style.borderRadius = '5px';
            raindrop.style.background = color;
            container.appendChild(raindrop);
            
            raindrop.animate([
                { transform: 'translateY(0)', opacity: 1 },
                { transform: 'translateY(300px)', opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            });
            
            setTimeout(() => {
                if (container.contains(raindrop)) {
                    container.removeChild(raindrop);
                }
            }, 1500);
        }, i * 50);
    }
}

