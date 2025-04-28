import { initSplashScreen } from 'screens/splash.js';
import { initGameScreen } from 'screens/game.js';

export class Engine {
    constructor() {
        this.gameState = {
            currentScreen: 'splash',
            words: [],
            active: false
        };
        this.collisionSounds = {
            light: new Audio('data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAAAAB9AG4AWgBJADwANQA3AEEATwBgAG8AfACDAIYAhAB8AHAAYgBSAEMAPAA7AD8ASQBVAGIAbQB0AHcAdQBvAGcAXQBTAEsARQBDAEQASQBPAFUA'), 
            medium: new Audio('data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWAAAACEAHIAYABQAEQAPgA9AEIATABXAGQAcAB5AIAAhACDAH4AdgBtAGEAVgBNAEUAQQBCAEUATABUAF0AZgBtAHIAdQB0AHAAbABmAF8AVwBRAEwASQBJAEsAUABVAFsAYABkAGcAaABo'),
            heavy: new Audio('data:audio/wav;base64,UklGRpwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXgAAACKAHwAcABlAFwAVgBSAFEAUgBVAFoAYABnAG4AdAB5AH0AgACCAIMAggCAAH0AeQB0AG4AaABiAFwAVwBTAFAAUABQAFIAVQBYAFwAYABkAGgAawBtAG8AcABwAHAAcABuAG0AawBpAGcAZQBjAGEAXwBdAFsAWQBYAFcAVgBWAFYAVgBX')
        };
        this.lastCollisionTime = 0; // To prevent too many collision sounds at once
    }
    
    init() {
        // Initialize screens
        initSplashScreen();
        const gameComponents = initGameScreen();
        
        // Store game components
        this.gameState.words = gameComponents.words;
        
        // Set game as active
        this.gameState.active = true;
        
        // Start game loop
        this.startGameLoop();
    }
    
    startGameLoop() {
        // Simple game loop for future expansion
        const loop = () => {
            if (this.gameState.active) {
                // Update game state here
                
                // Request next frame
                requestAnimationFrame(loop);
            }
        };
        
        // Start the loop
        requestAnimationFrame(loop);
    }

    handleCollisions() {
        const words = this.gameState.words;
        const numWords = words.length;
        let collisionsDetected = false;

        for (let i = 0; i < numWords; i++) {
            for (let j = i + 1; j < numWords; j++) {
                // ... existing collision detection code ...

                // Check for collision
                if (distSq < minDistSq) {
                    collisionsDetected = true;
                    
                    // ... existing collision resolution code ...
                    
                    // Play collision sound with cooldown and volume based on impact
                    const now = performance.now();
                    if (now - this.lastCollisionTime > 50) { // Cooldown of 50ms between sounds
                        const impactSpeed = Math.abs(velAlongNormal);
                        if (impactSpeed > 1) {
                            const volume = Math.min(impactSpeed / 10, 1);
                            let sound;
                            
                            if (impactSpeed < 3) sound = this.collisionSounds.light;
                            else if (impactSpeed < 6) sound = this.collisionSounds.medium;
                            else sound = this.collisionSounds.heavy;
                            
                            // Randomize pitch slightly for variety
                            sound.playbackRate = 0.9 + Math.random() * 0.2;
                            sound.volume = volume * 0.3; // Keep volume moderate
                            sound.currentTime = 0;
                            sound.play().catch(e => {/* Ignore autoplay blocking */});
                            this.lastCollisionTime = now;
                        }
                    }
                    
                    // Create subtle visual collision effect at contact point
                    if (Math.abs(velAlongNormal) > 0.5) {
                        const contactX = (word1.x + word1.radius) + nx * word1.radius;
                        const contactY = (word1.y + word1.radius) + ny * word1.radius;
                        this.createCollisionEffect(contactX, contactY, Math.abs(velAlongNormal));
                    }
                }
            }
        }
        
        return collisionsDetected;
    }
    
    createCollisionEffect(x, y, intensity) {
        const container = this.container;
        if (!container) return;
        
        const size = Math.min(5 + intensity * 2, 15);
        const particle = document.createElement('div');
        particle.classList.add('collision-particle');
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        container.appendChild(particle);
        
        // Quick fade animation
        particle.animate([
            { opacity: 0.8, transform: 'scale(0.5)' },
            { opacity: 0, transform: 'scale(1.5)' }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
        
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, 300);
    }
}