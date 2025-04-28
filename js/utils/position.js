export function getRandomPosition(element, container) {
    const containerRect = container.getBoundingClientRect();
    const elementWidth = parseFloat(element.style.width) || 100;
    const elementHeight = parseFloat(element.style.height) || 100;

    if (containerRect.width <= elementWidth || containerRect.height <= elementHeight) {
        console.warn("Container is smaller than the element, positioning at top-left.");
        return { x: 0, y: 0 };
    }

    const maxX = containerRect.width - elementWidth;
    const maxY = containerRect.height - elementHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    return { x, y };
}