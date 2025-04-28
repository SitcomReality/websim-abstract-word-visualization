import { getRandomPosition } from 'utils/position.js';
import { createTrail } from 'components/Trail.js';
import { createSpecialEffect } from 'effects/effectManager.js';
import { PHYSICS_CONFIG, WORDS_DATA } from 'config/constants.js';
import { WordInteractionHandler } from 'components/WordInteractionHandler.js';

export class Word {
    constructor(data, container, engine) {
        this.id = data.id;
        this.text = data.text;
        this.size = data.size;
        this.radius = this.size / 2;
        this.colors = data.colors;
        this.container = container;
        this.engine = engine;
        this.element = null;

        // Fetch full data including new categories
        const wordDefinition = WORDS_DATA.find(wd => wd.id === this.id) || data;
        this.baseEnergyPotential = wordDefinition.energyPotential || 0;
        this.energyPotential = this.baseEnergyPotential;
        this.description = wordDefinition?.description || this.text; // Store description

        // Add new GDD properties
        this.ontologicalCategory = wordDefinition.ontologicalCategory || 'Meso'; // Default Micro, Meso, Macro
        this.epistemologicalSchool = wordDefinition.epistemologicalSchool || 'Rationalism'; // Default Rationalism, Empiricism, Idealism, Materialism
        this.methodologicalApproach = wordDefinition.methodologicalApproach || 'Analytical'; // Default Dialectic, Analytical, Synthetic, Hermeneutic

        this.x = 0;
        this.y = 0;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.damping = PHYSICS_CONFIG.DAMPING;
        this.pushForce = PHYSICS_CONFIG.PUSH_FORCE;
        this.maxSpeed = PHYSICS_CONFIG.MAX_SPEED;
        this.mass = Math.PI * this.radius * this.radius;
        this.baseRestitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0] + Math.random() * (PHYSICS_CONFIG.RESTITUTION_RANGE[1] - PHYSICS_CONFIG.RESTITUTION_RANGE[0]);
        this.restitution = this.baseRestitution;

        this.isDragging = false;
        this.isBeingDestroyed = false;
        this.lastActivationTime = 0;
        this.activationCooldown = 1000; // 1 second cooldown between activations
        this.activationCount = 0; // Track how many times this word has been activated
        this.isActive = false; // More explicit tracking of activation state
        this.isVisible = true; // For upgrades like Chromatic Blindness

        this.init();
        this.interactionHandler = new WordInteractionHandler(this, this.container, this.engine);
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        // Add classes based on new categories for potential styling
        this.element.className = `word word-ont-${this.ontologicalCategory.toLowerCase()} word-epi-${this.epistemologicalSchool.toLowerCase()} word-met-${this.methodologicalApproach.toLowerCase()}`;

        // Add description element using stored description
        const descriptionEl = document.createElement('div');
        descriptionEl.className = 'word-description';
        // Add categories to tooltip
        descriptionEl.innerHTML = `
            ${this.description}<br>
            <span class="tooltip-category">[${this.ontologicalCategory}, ${this.epistemologicalSchool}, ${this.methodologicalApproach}]</span>
        `;

        this.element.innerHTML = `<span>${this.text}</span>`;
        this.element.appendChild(descriptionEl);

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        this.element.style.position = 'absolute';
        this.element.style.left = '0px'; // Base position for transform origin
        this.element.style.top = '0px';  // Base position for transform origin
        // Initialize position via transform
        this.updateElementPosition();

        this.container.appendChild(this.element);

        this.addEventListeners();

        // Initial visibility check based on engine state
        this.updateVisibility();
    }

    addEventListeners() {
        // Prevent interaction if not visible
        const handleInteraction = (handlerFn, event) => {
            if (!this.isVisible || this.isBeingDestroyed) return;
            handlerFn.call(this.interactionHandler, event);
        };

        const handleActivation = (event) => {
            if (!this.isVisible || this.isBeingDestroyed) return;
            if (!this.interactionHandler.dragMoved) {
                this.activate();
            }
        }

        this.element.addEventListener('click', handleActivation);

        this.element.addEventListener('mousedown', (e) => handleInteraction(this.interactionHandler.startDrag, e));
        // Mouse move/up are window events, handled by InteractionHandler

        this.element.addEventListener('touchstart', (e) => {
            if (e.target === this.element || e.target.parentNode === this.element) {
                handleInteraction(this.interactionHandler.startDrag, e.touches[0]);
            }
        }, { passive: false });
        // Touch move/end are window events, handled by InteractionHandler

        // Re-add window listeners from interaction handler here for completeness
        // These are already added in the WordInteractionHandler, technically redundant but safe
        window.addEventListener('mousemove', (e) => this.interactionHandler.drag(e));
        window.addEventListener('mouseup', (e) => this.interactionHandler.endDrag(e));
        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.interactionHandler.drag(e.touches[0]);
            }
        }, { passive: false });
        window.addEventListener('touchend', (e) => {
            if (this.isDragging) {
                this.interactionHandler.endDrag(e.changedTouches[0]);
            }
        });
        window.addEventListener('touchcancel', (e) => {
            if (this.isDragging) {
                this.interactionHandler.endDrag(e.changedTouches[0], true);
            }
        });

    }

    update(dt = 1) {
        if (this.isDragging || !this.isVisible) return;

        // Apply Quantum Uncertainty effect if active
        if (this.engine.gameState.quantumUncertaintyActive) {
            const isHovered = this.element && this.element.matches(':hover');
            if (!isHovered && Math.random() < 0.005) { // Low chance per frame
                const jumpDistance = 30;
                this.x += (Math.random() - 0.5) * jumpDistance * 2;
                this.y += (Math.random() - 0.5) * jumpDistance * 2;

                // Clamp after jump
                const containerRect = this.container.getBoundingClientRect();
                if (containerRect.width > 0 && containerRect.height > 0) {
                    const leftBoundary = 0;
                    const rightBoundary = containerRect.width - this.size;
                    const topBoundary = 0;
                    const bottomBoundary = containerRect.height - this.size;
                    this.x = Math.max(leftBoundary, Math.min(this.x, rightBoundary));
                    this.y = Math.max(topBoundary, Math.min(this.y, bottomBoundary));
                }

                this.updateElementPosition();

                // Chance to generate energy on teleport
                if (Math.random() < 0.2 && this.engine.addEnergy) {
                    const energyGain = 5;
                    this.engine.addEnergy(energyGain);
                    this.createFloatingRewardParticles(this.x + this.radius, this.y + this.radius, energyGain);
                }
            }
        }


        // Apply physics only if not deterministic or if moving
        if (!this.engine.gameState.deterministicUniverseActive || (this.vx !== 0 || this.vy !== 0)) {
            this.vx += (Math.random() - 0.5) * this.pushForce * dt;
            this.vy += (Math.random() - 0.5) * this.pushForce * dt;

            this.vx *= Math.pow(this.damping, dt);
            this.vy *= Math.pow(this.damping, dt);

            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > this.maxSpeed) {
                this.vx = (this.vx / speed) * this.maxSpeed;
                this.vy = (this.vy / speed) * this.maxSpeed;
            }
            if (speed < PHYSICS_CONFIG.MIN_SPEED && speed > 0) {
                this.vx = 0;
                this.vy = 0;
            }
        }

        let nextX = this.x + this.vx * dt;
        let nextY = this.y + this.vy * dt;

        // Bounds checking
        const containerRect = this.container.getBoundingClientRect();
        if (containerRect.width <= 0 || containerRect.height <= 0) {
            this.x = nextX;
            this.y = nextY;
        } else {
            const leftBoundary = 0;
            const rightBoundary = containerRect.width - this.size;
            const topBoundary = 0;
            const bottomBoundary = containerRect.height - this.size;

            if (nextX < leftBoundary || nextX > rightBoundary) {
                // If deterministic, stop at boundary. Otherwise, bounce.
                if (this.engine.gameState.deterministicUniverseActive) {
                    this.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary));
                    this.vx = 0;
                } else {
                    this.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary));
                    this.vx *= -this.restitution;
                }

            } else {
                this.x = nextX;
            }

            if (nextY < topBoundary || nextY > bottomBoundary) {
                if (this.engine.gameState.deterministicUniverseActive) {
                    this.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary));
                    this.vy = 0;
                } else {
                    this.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary));
                    this.vy *= -this.restitution;
                }
            } else {
                this.y = nextY;
            }
        }

        this.updateElementPosition();

        // Visual indication of resonance compatibility with last activated word
        this.updateResonanceVisuals();
    }

    // Method to update visibility based on engine state (e.g., Chromatic Blindness)
    updateVisibility() {
        if (!this.engine || !this.element) return;

        const blindColor = this.engine.gameState.chromaticBlindnessColor;
        this.isVisible = !(blindColor && this.epistemologicalSchool.toLowerCase() === blindColor.toLowerCase());

        this.element.style.display = this.isVisible ? 'flex' : 'none';
        // If becoming invisible while dragging, cancel drag
        if (!this.isVisible && this.isDragging) {
            this.interactionHandler.endDrag(null, true); // Cancel drag
        }
    }


    updateResonanceVisuals() {
        if (!this.engine.resonanceSystem || !this.element || this.engine.gameState.currentScreen !== 'game' || !this.isVisible) {
            if (this.element) this.element.classList.remove('resonance-ready');
            return;
        }

        // Check if this word can form a resonance with the last activated word
        const hasResonance = this.engine.resonanceSystem.canFormResonance(this);

        if (hasResonance) {
            this.element.classList.add('resonance-ready');
        } else {
            this.element.classList.remove('resonance-ready');
        }
    }

    updateElementPosition() {
        // Ensure x and y are valid numbers before applying the transform
        if (this.element && !isNaN(this.x) && !isNaN(this.y)) {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        } else if (this.element) {
            // Fallback if position becomes invalid, log warning and reset
            console.warn(`Invalid position for word ${this.id}: (${this.x}, ${this.y}). Resetting to center.`);
            const containerRect = this.container.getBoundingClientRect();
            this.x = (containerRect.width - this.size) / 2 || 0;
            this.y = (containerRect.height - this.size) / 2 || 0;
            this.vx = 0;
            this.vy = 0;
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }


    activate() {
        if (this.isActive || this.isDragging || this.isBeingDestroyed || !this.isVisible) return;

        // Check activation cooldown
        const now = Date.now();
        if (now - this.lastActivationTime < this.activationCooldown) {
            this.showCooldownFeedback();
            return;
        }

        // Handle Skeptical Method upgrade
        if (this.engine.gameState.skepticalMethodActive && Math.random() < 0.3) {
            console.log("Skeptical Method: Activation Failed");
            this.showCooldownFeedback(); // Use cooldown flash for failure indication
            this.lastActivationTime = now; // Still consume cooldown
            return; // Activation fails
        }


        this.lastActivationTime = now;
        this.activationCount++;
        this.isActive = true; // Set active flag

        this.element.classList.add('active'); // Add active class for general styling (e.g., brighter shadow)


        // Apply pop animation using Web Animations API
        if (this.element) {
            const currentTransform = this.element.style.transform || `translate(${this.x}px, ${this.y}px)`;
            this.element.animate([
                { transform: `${currentTransform} scale(1)` },
                { transform: `${currentTransform} scale(1.2)` },
                { transform: `${currentTransform} scale(1)` }
            ], {
                duration: 300,
                easing: 'ease-out'
            });
        }

        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);

        // Apply resonance multiplier if system exists
        let resonanceMultiplier = 1;
        if (this.engine.resonanceSystem) {
            resonanceMultiplier = this.engine.resonanceSystem.wordActivated(this);
        }

        // Apply combo system multiplier if it exists
        let comboMultiplier = 1;
        if (this.engine.comboSystem) {
            comboMultiplier = this.engine.comboSystem.registerActivation();
        }

        // Apply Skeptical Method bonus if active and successful
        const skepticalBonus = this.engine.gameState.skepticalMethodActive ? 3 : 1;

        // Apply Chromatic Blindness bonus if active
        const chromaticBonus = (this.engine.gameState.chromaticBlindnessColor && this.epistemologicalSchool.toLowerCase() !== this.engine.gameState.chromaticBlindnessColor.toLowerCase()) ? 4 : 1;


        const totalMultiplier = resonanceMultiplier * comboMultiplier * skepticalBonus * chromaticBonus;

        if (this.engine && typeof this.engine.addEnergy === 'function') {
            const energyGained = this.energyPotential * totalMultiplier;
            this.engine.addEnergy(energyGained);

            // Show the multiplier if > 1
            if (totalMultiplier > 1) {
                this.showMultiplierEffect(totalMultiplier);
            }

            // Track word activations for achievements
            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.incrementAchievementProgress('word_activator');
            }

            // Add floating particles for extra visual feedback
            this.createFloatingRewardParticles(centerX, centerY, Math.ceil(energyGained));

            // Show tutorial hints based on activation count
            // this.showTutorialHints(); // Tutorial hints might be less relevant with roguelike structure
        } else {
            console.warn(`Word ${this.id}: Engine or addEnergy function not available for energy harvesting.`);
        }

        setTimeout(() => {
            this.isActive = false; // Reset active flag
            if (this.element && this.element.classList.contains('active')) {
                this.element.classList.remove('active');
            }
        }, 1500); // Duration the 'active' state styles persist
    }

    showCooldownFeedback() {
        if (!this.element) return;

        // Brief visual feedback for cooldown
        this.element.classList.add('cooldown-flash');
        setTimeout(() => {
            if (this.element) this.element.classList.remove('cooldown-flash');
        }, 300);
    }

    createFloatingRewardParticles(x, y, amount) {
        if (!this.container || amount <= 0) return; // Don't show for 0 energy
        const particleCount = Math.min(Math.ceil(amount / 5), 8); // Scale particles with energy, max 8


        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            // Show amount only on the first particle for clarity
            particle.textContent = i === 0 ? `+${Math.floor(amount)}` : '+';


            particle.style.position = 'absolute';
            particle.style.left = `${x + (Math.random() - 0.5) * 30}px`;
            particle.style.top = `${y}px`;
            particle.style.color = '#4caf50';
            particle.style.fontWeight = 'bold';
            particle.style.fontSize = i === 0 ? '20px' : '14px';
            particle.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
            particle.style.zIndex = '100';
            particle.style.pointerEvents = 'none';

            this.container.appendChild(particle);

            const angle = (Math.random() * Math.PI) - (Math.PI/2); // Upward trajectory
            const speed = 2 + Math.random() * 3;

            particle.animate([
                {
                    transform: 'translate(-50%, -50%)',
                    opacity: 1
                },
                {
                    transform: `translate(${Math.cos(angle) * 100 - 50}px, ${Math.sin(angle) * 100 - 50}px) scale(${i === 0 ? 1.2 : 0.8})`,
                    opacity: 0
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (this.container && this.container.contains(particle)) {
                    this.container.removeChild(particle);
                }
            };
        }
    }

    showMultiplierEffect(multiplier) {
        if (!this.container) return;
        const multiplierEl = document.createElement('div');
        multiplierEl.className = 'word-multiplier';
        multiplierEl.textContent = `×${multiplier.toFixed(1)}`;

        multiplierEl.style.position = 'absolute';
        multiplierEl.style.left = `${this.x + this.size/2}px`;
        multiplierEl.style.top = `${this.y - 20}px`;
        multiplierEl.style.color = '#4caf50'; // Use green for general multiplier
        multiplierEl.style.fontWeight = 'bold';
        multiplierEl.style.fontSize = '1.2em';
        multiplierEl.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        multiplierEl.style.pointerEvents = 'none';
        multiplierEl.style.zIndex = '200';
        multiplierEl.style.transform = 'translate(-50%, -50%)';

        this.container.appendChild(multiplierEl);

        multiplierEl.animate([
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -100%)' }
        ], {
            duration: 1200,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.container && this.container.contains(multiplierEl)) {
                this.container.removeChild(multiplierEl);
            }
        };
    }

    applyImpulse(impulseX, impulseY) {
        // Don't apply impulse if deterministic universe is active
        if (this.engine.gameState.deterministicUniverseActive) return;

        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        } else {
            // Avoid division by zero or very small mass
            this.vx += impulseX * 10; // Arbitrary large multiplier
            this.vy += impulseY * 10;
        }
    }

    destroy(skipAnimation = false) {
        if (this.isBeingDestroyed) return;

        this.isBeingDestroyed = true;
        this.isVisible = false; // Ensure it's marked as not visible

        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            const index = this.engine.gameState.words.indexOf(this);
            if (index > -1) {
                this.engine.gameState.words.splice(index, 1);
            }
        }

        if (skipAnimation || !this.element || !this.container) {
            if (this.element && this.container && this.container.contains(this.element)) {
                this.container.removeChild(this.element);
            }
            this.element = null;
        } else {
            this.element.classList.add('destroy'); // Use class for potential styling
            this.element.style.pointerEvents = 'none';
            const currentTransform = this.element.style.transform || 'translate(0,0)';
            this.element.animate([
                { opacity: 1, transform: `${currentTransform} scale(1)` },
                { opacity: 0, transform: `${currentTransform} scale(0.5)` }
            ], {
                duration: 500,
                easing: 'ease-in'
            }).onfinish = () => {
                if (this.element && this.container && this.container.contains(this.element)) {
                    this.container.removeChild(this.element);
                }
                this.element = null;
            };
        }
    }
}