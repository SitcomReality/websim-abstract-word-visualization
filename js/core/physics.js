import { PHYSICS_CONFIG } from 'config/constants.js';

export class Physics {
    constructor(engine) {
        this.engine = engine;
        this.lastCollisionTime = 0;
        this.collisionCooldown = PHYSICS_CONFIG.COLLISION_COOLDOWN;
        this.collisionEnergyMultiplier = 1.0;
    }

    handleCollisions(words, container) {
        if (!container) return;
        const numWords = words.length;

        for (let i = 0; i < numWords; i++) {
            for (let j = i + 1; j < numWords; j++) {
                const word1 = words[i];
                const word2 = words[j];

                const dx = (word2.x + word2.radius) - (word1.x + word1.radius);
                const dy = (word2.y + word2.radius) - (word1.y + word2.radius);
                const distSq = dx * dx + dy * dy;
                const minDist = word1.radius + word2.radius;
                const minDistSq = minDist * minDist;

                if (distSq < minDistSq && distSq > 1e-6) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;

                    const nx = dx / dist;
                    const ny = dy / dist;

                    const invMass1 = word1.physics.mass > 0 ? 1 / word1.physics.mass : 0;
                    const invMass2 = word2.physics.mass > 0 ? 1 / word2.physics.mass : 0;
                    const totalInverseMass = invMass1 + invMass2;

                    if (totalInverseMass > 0) {
                        const move1 = overlap * (invMass1 / totalInverseMass);
                        const move2 = overlap * (invMass2 / totalInverseMass);

                        word1.x -= nx * move1;
                        word1.y -= ny * move1;
                        word2.x += nx * move2;
                        word2.y += ny * move2;

                        this.clampToBounds(word1, container);
                        this.clampToBounds(word2, container);
                        word1.renderer.updatePosition();
                        word2.renderer.updatePosition();
                    }

                    const relVx = word1.physics.vx - word2.physics.vx;
                    const relVy = word1.physics.vy - word2.physics.vy;

                    const velAlongNormal = relVx * nx + relVy * ny;

                    if (velAlongNormal > 0) {
                        continue;
                    }

                    const restitution = Math.min(word1.physics.restitution, word2.physics.restitution);
                    let j = -(1 + restitution) * velAlongNormal;
                    if (totalInverseMass > 0) {
                        j /= totalInverseMass;
                    } else {
                        j = 0;
                    }

                    const impulseX = j * nx;
                    const impulseY = j * ny;

                    word1.applyImpulse(impulseX, impulseY);
                    word2.applyImpulse(-impulseX, -impulseY);

                    const now = performance.now();
                    if (now - this.lastCollisionTime > this.collisionCooldown) {
                        const impactSpeed = Math.abs(velAlongNormal);
                        if (impactSpeed > 1) {
                            let sound;
                            if (impactSpeed < 3) sound = this.engine.collisionSounds.light;
                            else if (impactSpeed < 6) sound = this.engine.collisionSounds.medium;
                            else sound = this.engine.collisionSounds.heavy;

                            if (sound && sound.readyState >= 2) {
                                sound.playbackRate = 0.9 + Math.random() * 0.2;
                                sound.volume = Math.min(0.1 + impactSpeed * 0.05, 0.5);
                                sound.currentTime = 0;
                                sound.play().catch(e => { /* Optional */ });
                                this.lastCollisionTime = now;
                            }

                            const contactX = (word1.x + word1.radius) + nx * (word1.radius - overlap / 2);
                            const contactY = (word1.y + word1.radius) + ny * (word1.radius - overlap / 2);
                            this.createCollisionEffect(contactX, contactY, impactSpeed, container);
                        }
                    }
                }
            }
        }
    }

    createCollisionEffect(x, y, intensity, container) {
        if (!container) return;

        const size = Math.min(5 + intensity * 1.5, 12);
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
        particle.style.transform = 'translate(-50%, -50%)'; 
        particle.style.zIndex = '50'; 
        container.appendChild(particle);

        particle.animate([
            { opacity: 0.8, transform: 'translate(-50%, -50%) scale(0.5)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' } 
        ], {
            duration: 300, 
            easing: 'ease-out'
        }).onfinish = () => {
            if (container && container.contains(particle)) {
                container.removeChild(particle);
            }
        };
    }

    clampToBounds(word, container) {
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - word.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - word.size;

        word.x = Math.max(leftBoundary, Math.min(word.x, rightBoundary));
        word.y = Math.max(topBoundary, Math.min(word.y, bottomBoundary));
    }
}