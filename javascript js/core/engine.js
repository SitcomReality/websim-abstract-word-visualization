import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false
        };
        this.lastTimestamp = 0;
        this.container = null; // Store container reference
    }

    init() {
        // Initialize screens
        initSplashScreen(this.switchToGameScreen.bind(this)); // Pass callback to switch screen
        const gameComponents = initGameScreen();

        // Store game components
        this.gameState.words = gameComponents.words;
        this.container = gameComponents.container; // Store container reference

        // Optional: Initial collision avoidance
        // this.resolveInitialOverlaps();

        // Don't start game loop until screen is switched
    }

    // Optional method to spread out words initially if they overlap
    resolveInitialOverlaps(maxIterations = 10) {
        if (!this.container || this.gameState.words.length < 2) return;

        for (let iter = 0; iter < maxIterations; iter++) {
            let overlapsFound = false;
            for (let i = 0; i < this.gameState.words.length; i++) {
                for (let j = i + 1; j < this.gameState.words.length; j++) {
                    const word1 = this.gameState.words[i];
                    const word2 = this.gameState.words[j];

                    const dx = (word2.x + word2.radius) - (word1.x + word1.radius);
                    const dy = (word2.y + word2.radius) - (word1.y + word1.radius);
                    const distSq = dx * dx + dy * dy;
                    const minDist = word1.radius + word2.radius;
                    const minDistSq = minDist * minDist;

                    if (distSq < minDistSq && distSq > 0) {
                        overlapsFound = true;
                        const dist = Math.sqrt(distSq);
                        const overlap = minDist - dist;
                        const pushFactor = 0.5; // How much to push apart each iteration

                        // Calculate push vector (normalized)
                        const pushX = (dx / dist) * (overlap * pushFactor);
                        const pushY = (dy / dist) * (overlap * pushFactor);

                        // Apply push (distribute based on mass, or equally)
                        const totalMass = word1.mass + word2.mass;
                        const pushRatio1 = word2.mass / totalMass;
                        const pushRatio2 = word1.mass / totalMass;

                        word1.x -= pushX * pushRatio1;
                        word1.y -= pushY * pushRatio1;
                        word2.x += pushX * pushRatio2;
                        word2.y += pushY * pushRatio2;

                        // Clamp to boundaries after pushing
                        this.clampToBounds(word1);
                        this.clampToBounds(word2);
                    } else if (distSq === 0) { // Exactly overlapping centers, push randomly
                        overlapsFound = true;
                         word2.x += (Math.random() - 0.5) * 2;
                         word2.y += (Math.random() - 0.5) * 2;
                         this.clampToBounds(word2);
                    }
                }
            }
             if (!overlapsFound) break; // Exit if no overlaps in this iteration
        }

         // Final update of element positions after resolving overlaps
         this.gameState.words.forEach(word => word.updateElementPosition());
    }

     clampToBounds(word) {
        const containerRect = this.container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - word.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - word.size;

        word.x = Math.max(leftBoundary, Math.min(word.x, rightBoundary));
        word.y = Math.max(topBoundary, Math.min(word.y, bottomBoundary));
    }


    switchToGameScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const gameScreen = document.getElementById('game-screen');

        if (splashScreen) splashScreen.classList.remove('active');
        if (gameScreen) {
             gameScreen.classList.add('active');
             // Ensure container ref is valid if game screen was hidden
             this.container = gameScreen.querySelector('.container');
             if (this.container) {
                // Resolve initial overlaps when game starts
                this.resolveInitialOverlaps();
             } else {
                 console.error("Game container not found after switching screen!");
             }
        }


        this.gameState.currentScreen = 'game';
        this.gameState.active = true;
        this.lastTimestamp = performance.now(); // Initialize timestamp
        this.startGameLoop(); // Start loop only when game screen is active
    }

    startGameLoop() {
        let lastTimestamp = performance.now(); // Use local timestamp for dt calculation

        const loop = (timestamp) => {
            if (!this.gameState.active) return; // Stop loop if game is not active

            const dt = Math.min((timestamp - lastTimestamp) / 16.67, 5); // Calculate delta time (normalize to 60fps), clamp max dt
            lastTimestamp = timestamp;

            // Update game state based on the current screen
            if (this.gameState.currentScreen === 'game' && this.container) {
                this.updateGame(dt);
            }

            // Request next frame
            requestAnimationFrame(loop);
        };

        // Start the loop
        requestAnimationFrame(loop);
    }

    updateGame(dt) {
        // 1. Update all word positions based on velocity
        this.gameState.words.forEach(word => word.update(dt));

        // 2. Handle collisions
        this.handleCollisions();

        // 3. Update DOM elements (already handled in word.update via updateElementPosition)
        // If collision resolution moved elements, might need another updateElementPosition call,
        // but it should be handled by the next frame's update call.
    }

    handleCollisions() {
        const words = this.gameState.words;
        const numWords = words.length;

        for (let i = 0; i < numWords; i++) {
            for (let j = i + 1; j < numWords; j++) {
                const word1 = words[i];
                const word2 = words[j];

                // Calculate distance between centers
                const dx = (word2.x + word2.radius) - (word1.x + word1.radius);
                const dy = (word2.y + word2.radius) - (word1.y + word1.radius);
                const distSq = dx * dx + dy * dy;
                const minDist = word1.radius + word2.radius;
                const minDistSq = minDist * minDist;

                // Check for collision
                if (distSq < minDistSq) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;

                    // --- Resolve Overlap ---
                    // Move words apart along the collision normal
                    // Avoid division by zero if dist is exactly 0
                    const nx = dist === 0 ? 1 : dx / dist; // Collision normal x
                    const ny = dist === 0 ? 0 : dy / dist; // Collision normal y

                    // Calculate how much each word should move (proportional to inverse mass)
                    const totalInverseMass = (1 / word1.mass) + (1 / word2.mass);
                    const move1 = overlap * ( (1 / word1.mass) / totalInverseMass );
                    const move2 = overlap * ( (1 / word2.mass) / totalInverseMass );

                    word1.x -= nx * move1;
                    word1.y -= ny * move1;
                    word2.x += nx * move2;
                    word2.y += ny * move2;

                     // After moving, update element positions immediately to reflect separation
                     word1.updateElementPosition();
                     word2.updateElementPosition();

                    // --- Resolve Velocity (Collision Response) ---
                    // Relative velocity
                    const relVx = word1.vx - word2.vx;
                    const relVy = word1.vy - word2.vy;

                    // Velocity along the normal
                    const velAlongNormal = relVx * nx + relVy * ny;

                    // Do not resolve if velocities are separating
                    if (velAlongNormal > 0) {
                        continue;
                    }

                    // Calculate restitution (bounciness)
                    const restitution = Math.min(word1.restitution, word2.restitution);

                    // Calculate impulse scalar (j)
                    let j = -(1 + restitution) * velAlongNormal;
                    j /= totalInverseMass; // Or: j /= (1 / word1.mass + 1 / word2.mass);

                    // Apply impulse
                    const impulseX = j * nx;
                    const impulseY = j * ny;

                    word1.applyImpulse(impulseX, impulseY);
                    word2.applyImpulse(-impulseX, -impulseY);

                    // Optional: Add a small visual/audio cue for collision here
                    // e.g., createCollisionEffect((word1.x + word1.radius + word2.x + word2.radius)/2, ...);
                }
            }
        }
    }


    stopGameLoop() {
        this.gameState.active = false;
    }
}