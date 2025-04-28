// Updated function name and return value
export function getRandomPosition(element, container) {
    const containerRect = container.getBoundingClientRect();
    // Use fixed size from data if available, otherwise measure element
    const elementWidth = element.offsetWidth || parseFloat(element.style.width) || 100;
    const elementHeight = element.offsetHeight || parseFloat(element.style.height) || 100;

    // Ensure element stays fully within the container bounds
    const maxX = containerRect.width - elementWidth;
    const maxY = containerRect.height - elementHeight;

    // Add a small margin from the edges
    const margin = 20;
    const x = Math.max(margin, Math.random() * (maxX - 2 * margin));
    const y = Math.max(margin, Math.random() * (maxY - 2 * margin));

    // Return coordinates instead of setting style directly
    return { x, y };
}

// Remove the old positionRandomly or keep if used elsewhere (currently not)
/*
export function positionRandomly(element) {
    // ... (old implementation)
}
*/