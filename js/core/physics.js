import { PHYSICS_CONFIG } from 'config/constants.js';

export class Physics {
    constructor(engine) {
        this.engine = engine; 
        this.lastCollisionTime = 0; 
        this.collisionCooldown = PHYSICS_CONFIG.COLLISION_COOLDOWN;
    }

    updatePhysics(words, dt, container) {
        if (!container) return;
        words.forEach(word => word.update(dt)); 
    }

    handleCollisions(words, container) {
        if (!container) return;
        const numWords = words.length;

        for (let i = 0; i < numWords; i++) {
            for (let j = i + 1; j < numWords; j++) {
                const word1 = words[i];
                const word2 = words[j];

                const dx = (word2.x + word2.radius) - (word1.x + word1.radius);
                const dy = (word2.y + word2.radius) - (word1.y + word1.radius);
                const distSq = dx * dx + dy * dy;
                const minDist = word1.radius + word2.radius;
                const minDistSq = minDist * minDist;

                if (distSq < minDistSq && distSq > 1e-6) { 
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;

                    const nx = dx / dist;
                    const ny = dy / dist;

                    const invMass1 = word1.mass > 0 ? 1 / word1.mass : 0;
                    const invMass2 = word2.mass > 0 ? 1 / word2.mass : 0;
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
                        word1.updateElementPosition();
                        word2.updateElementPosition();
                    }

                    const relVx = word1.vx - word2.vx;
                    const relVy = word1.vy - word2.vy;

                    const velAlongNormal = relVx * nx + relVy * ny;

                    if (velAlongNormal > 0) {
                        continue;
                    }

                    const restitution = Math.min(word1.restitution, word2.restitution);
                    let j = -(1 + restitution) * velAlongNormal;
                    if (totalInverseMass > 0) {
                        j /= totalInverseMass;
                    } else {
                        j = 0;
                    }

                    const impulseX = j * nx;
                    const impulseY = j * ny;

                    word1.vx += impulseX * invMass1;
                    word1.vy += impulseY * invMass1;
                    word2.vx -= impulseX * invMass2;
                    word2.vy -= impulseY * invMass2;

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
                                sound.play().catch(e => { /* Optional: handle play error */ });
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

    resolveInitialOverlaps(words, container, maxIterations = 10, pushFactor = 0.6) {
        if (!container || words.length < 2) return;
        console.log("Resolving initial overlaps...");

        for (let iter = 0; iter < maxIterations; iter++) {
            let overlapsFound = false;
            for (let i = 0; i < words.length; i++) {
                for (let j = i + 1; j < words.length; j++) {
                    const word1 = words[i];
                    const word2 = words[j];

                    const dx = (word2.x + word2.radius) - (word1.x + word1.radius);
                    const dy = (word2.y + word2.radius) - (word1.y + word1.radius); 
                    const distSq = dx * dx + dy * dy;
                    const minDist = word1.radius + word2.radius;
                    const minDistSq = minDist * minDist;

                    if (distSq < minDistSq && distSq > 1e-6) { 
                        overlapsFound = true;
                        const dist = Math.sqrt(distSq);
                        const overlap = minDist - dist;

                        const pushX = (dx / dist) * (overlap * pushFactor);
                        const pushY = (dy / dist) * (overlap * pushFactor);

                        const totalMass = word1.mass + word2.mass;
                        const pushRatio1 = totalMass > 0 ? word2.mass / totalMass : 0.5;
                        const pushRatio2 = totalMass > 0 ? word1.mass / totalMass : 0.5;

                        word1.x -= pushX * pushRatio1;
                        word1.y -= pushY * pushRatio1;
                        word2.x += pushX * pushRatio2;
                        word2.y += pushY * pushRatio2;

                        this.clampToBounds(word1, container);
                        this.clampToBounds(word2, container);

                    } else if (distSq <= 1e-6) { 
                        overlapsFound = true;
                        word2.x += (Math.random() - 0.5) * 2;
                        word2.y += (Math.random() - 0.5) * 2;
                        this.clampToBounds(word2, container);
                    }
                }
            }
            words.forEach(word => word.updateElementPosition());

            if (!overlapsFound) {
                console.log(`Initial overlaps resolved after ${iter + 1} iterations.`);
                break; 
            }
            if (iter === maxIterations - 1) {
                console.warn("Max iterations reached for initial overlap resolution. Some overlaps might remain.");
            }
        }
        words.forEach(word => word.updateElementPosition());
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