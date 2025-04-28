import { PHYSICS_CONFIG } from 'config/constants.js';

export class WordPhysics {
    constructor(core, engine) {
        this.core = core;
        this.engine = engine;

        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.damping = PHYSICS_CONFIG.DAMPING;
        this.pushForce = PHYSICS_CONFIG.PUSH_FORCE;
        this.maxSpeed = PHYSICS_CONFIG.MAX_SPEED;
        this.mass = Math.PI * this.core.radius * this.core.radius;
        this.baseRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0] + Math.random() * (PHYSICS_CONFIG.RESTITUTION_RANGE[1] - PHYSICS_CONFIG.RESTITUTION_RANGE[0]);
        this.restitution = this.baseRestitution;
    }

    updatePhysics(dt = 1) {
        if (this.core.isDragging || !this.core.isVisible || this.core.isBeingDestroyed) return;

        this.applyQuantumUncertainty();

        // Apply physics only if not deterministic OR if it has velocity
        if (!this.engine.gameState.deterministicUniverseActive || (this.vx !== 0 || this.vy !== 0)) {
            this.applyForces(dt);
            this.applyDamping(dt);
            this.limitSpeed();
            this.stopIfSlow();
        }

        this.moveAndCheckBounds(dt);

        // Position update is handled by Word Core after physics update
    }

    applyQuantumUncertainty() {
        // Needs WordFeedback reference or engine event bus to show energy gain effect
        if (this.engine.gameState.quantumUncertaintyActive) {
            const isHovered = this.core.element && this.core.element.matches(':hover');
            if (!isHovered && Math.random() < 0.005) { // Chance to teleport
                const jumpDistance = 30;
                this.core.x += (Math.random() - 0.5) * jumpDistance * 2;
                this.core.y += (Math.random() - 0.5) * jumpDistance * 2;

                this.clampToBounds(); // Ensure it stays within bounds

                // Energy gain on teleport
                if (Math.random() < 0.2 && this.engine.addEnergy) {
                    const energyGain = 5;
                    this.engine.addEnergy(energyGain);
                    // TODO: Trigger visual feedback - needs access to WordFeedback or an event bus
                    // This might require passing feedback ref or using engine events
                    // For now, logging it
                    console.log(`Quantum Uncertainty generated ${energyGain} energy for ${this.core.id}`);
                }
            }
        }
    }

    applyForces(dt) {
        // Apply small random push if not deterministic
        if (!this.engine.gameState.deterministicUniverseActive) {
            this.vx += (Math.random() - 0.5) * this.pushForce * dt;
            this.vy += (Math.random() - 0.5) * this.pushForce * dt;
        }
    }

    applyDamping(dt) {
        this.vx *= Math.pow(this.damping, dt);
        this.vy *= Math.pow(this.damping, dt);
    }

    limitSpeed() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }
    }

    stopIfSlow() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < PHYSICS_CONFIG.MIN_SPEED && speed > 0) {
            this.vx = 0;
            this.vy = 0;
        }
    }

    moveAndCheckBounds(dt) {
        let nextX = this.core.x + this.vx * dt;
        let nextY = this.core.y + this.vy * dt;

        const containerRect = this.core.container?.getBoundingClientRect();
        if (!containerRect || containerRect.width <= 0 || containerRect.height <= 0) {
            // If container isn't valid, just update position without bounds check
            this.core.x = nextX;
            this.core.y = nextY;
            return;
        }

        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.core.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.core.size;

        // X-axis boundary collision
        if (nextX < leftBoundary || nextX > rightBoundary) {
            this.core.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary)); // Clamp position
            if (this.engine.gameState.deterministicUniverseActive) {
                this.vx = 0; // Stop in deterministic mode
            } else {
                this.vx *= -this.restitution; // Bounce otherwise
            }
        } else {
            this.core.x = nextX; // Update position if no collision
        }

        // Y-axis boundary collision
        if (nextY < topBoundary || nextY > bottomBoundary) {
            this.core.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary)); // Clamp position
            if (this.engine.gameState.deterministicUniverseActive) {
                this.vy = 0; // Stop in deterministic mode
            } else {
                this.vy *= -this.restitution; // Bounce otherwise
            }
        } else {
            this.core.y = nextY; // Update position if no collision
        }
    }

    clampToBounds() {
        const containerRect = this.core.container?.getBoundingClientRect();
        if (!containerRect || containerRect.width <= 0 || containerRect.height <= 0) return;

        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.core.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.core.size;
        this.core.x = Math.max(leftBoundary, Math.min(this.core.x, rightBoundary));
        this.core.y = Math.max(topBoundary, Math.min(this.core.y, bottomBoundary));
    }

    applyImpulse(impulseX, impulseY) {
        // Cannot apply impulse in deterministic universe after initial state
        if (this.engine.gameState.deterministicUniverseActive) return;

        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        } else {
            // Apply larger impulse if mass is very small/zero
            this.vx += impulseX * 10;
            this.vy += impulseY * 10;
        }
    }
}