// Position a word randomly but biased toward the center of the container
export function getRandomPosition(element, container) {
    const containerRect = container.getBoundingClientRect();
    const elementWidth = parseFloat(element.style.width) || 100;
    const elementHeight = parseFloat(element.style.height) || 100;

    if (containerRect.width <= elementWidth || containerRect.height <= elementHeight) {
        console.warn("Container is smaller than the element, positioning at top-left.");
        return { x: 0, y: 0 };
    }

    // Central bias: Use a normal distribution around the center
    // We'll clamp the result to fit within the container!
    const centerX = (containerRect.width - elementWidth) / 2;
    const centerY = (containerRect.height - elementHeight) / 2;

    // Generate an offset from center using Box-Muller transform for normal distribution
    function randomNormal(scale = 0.25) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        // Standard normal
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        // Scale so that about 95% of samples fall within 25% of the container size
        return num * scale;
    }
    // Allow positions up to ~1/4 width/height away from center (95% zone)
    const biasScaleX = containerRect.width / 4;
    const biasScaleY = containerRect.height / 4;
    let x = centerX + randomNormal() * biasScaleX;
    let y = centerY + randomNormal() * biasScaleY;

    // Clamp to ensure fully within container
    const margin = 20;
    x = Math.max(margin, Math.min(x, containerRect.width - elementWidth - margin));
    y = Math.max(margin, Math.min(y, containerRect.height - elementHeight - margin));

    return { x, y };
}