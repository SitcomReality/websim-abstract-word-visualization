export function positionRandomly(element) {
    const rect = element.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}

