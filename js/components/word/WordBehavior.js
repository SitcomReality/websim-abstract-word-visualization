import { PHYSICS_CONFIG } from 'config/constants.js';
import { createSpecialEffect } from 'effects/effectManager.js';

export class WordBehavior {
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

        this.lastActivationTime = 0;
        this.activationCooldown = 1000; 
        this.activationCount = 0;
    }

    updatePhysics(dt = 1) {
        if (this.core.isDragging || !this.core.isVisible || this.core.isBeingDestroyed) return;

        this.applyQuantumUncertainty();

        if (!this.engine.gameState.deterministicUniverseActive || (this.vx !== 0 || this.vy !== 0)) {
            this.applyForces(dt);
            this.applyDamping(dt);
            this.limitSpeed();
            this.stopIfSlow();
        }

        this.moveAndCheckBounds(dt);

        this.core.updateElementPosition(); 

        this.updateResonanceVisuals();
    }

    applyQuantumUncertainty() {
        if (this.engine.gameState.quantumUncertaintyActive) {
            const isHovered = this.core.element && this.core.element.matches(':hover');
            if (!isHovered && Math.random() < 0.005) { 
                const jumpDistance = 30;
                this.core.x += (Math.random() - 0.5) * jumpDistance * 2;
                this.core.y += (Math.random() - 0.5) * jumpDistance * 2;

                this.clampToBounds(); 

                if (Math.random() < 0.2 && this.engine.addEnergy) {
                    const energyGain = 5;
                    this.engine.addEnergy(energyGain);
                    this.createFloatingRewardParticles(this.core.x + this.core.radius, this.core.y + this.core.radius, energyGain);
                }
            }
        }
    }

    applyForces(dt) {
        this.vx += (Math.random() - 0.5) * this.pushForce * dt;
        this.vy += (Math.random() - 0.5) * this.pushForce * dt;
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
            this.core.x = nextX;
            this.core.y = nextY;
            return;
        }

        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.core.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.core.size;

        if (nextX < leftBoundary || nextX > rightBoundary) {
            if (this.engine.gameState.deterministicUniverseActive) {
                this.core.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary));
                this.vx = 0; 
            } else {
                this.core.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary));
                this.vx *= -this.restitution; 
            }
        } else {
            this.core.x = nextX;
        }

        if (nextY < topBoundary || nextY > bottomBoundary) {
            if (this.engine.gameState.deterministicUniverseActive) {
                this.core.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary));
                this.vy = 0; 
            } else {
                this.core.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary));
                this.vy *= -this.restitution; 
            }
        } else {
            this.core.y = nextY;
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

    activate() {
        if (this.core.isActive || this.core.isDragging || this.core.isBeingDestroyed || !this.core.isVisible) return;

        const now = Date.now();
        
        // Eternalism upgrade removes cooldowns
        if (!this.engine.gameState.eternalismActive && now - this.lastActivationTime < this.activationCooldown) {
            this.showCooldownFeedback();
            return;
        }

        // Check Categorical Imperative
        if (this.engine.gameState.categoricalImperativeActive) {
            const sequence = this.engine.gameState.categoricalSequence;
            const currentCategory = this.core.ontologicalCategory;
            
            // First activation in sequence
            if (!sequence.current) {
                if (currentCategory !== sequence.categories[0]) {
                    this.showCategoryFeedback(`Must start with ${sequence.categories[0]} concepts!`);
                    return;
                }
                sequence.current = currentCategory;
                sequence.lastWord = this.core;
                sequence.stepsComplete = 1;
            } 
            // Continuing a sequence
            else {
                const expectedIndex = sequence.categories.indexOf(sequence.current) + 1;
                
                // If we've completed the sequence, start over
                if (expectedIndex >= sequence.categories.length) {
                    // Reset and allow starting with any category
                    if (currentCategory !== sequence.categories[0]) {
                        this.showCategoryFeedback(`Must start with ${sequence.categories[0]} concepts!`);
                        return;
                    }
                    sequence.current = currentCategory;
                    sequence.lastWord = this.core;
                    sequence.stepsComplete = 1;
                }
                // Check if this activation follows the correct sequence
                else {
                    const expectedCategory = sequence.categories[expectedIndex];
                    if (currentCategory !== expectedCategory) {
                        this.showCategoryFeedback(`Expected ${expectedCategory} concept!`);
                        return;
                    }
                    sequence.current = currentCategory;
                    sequence.lastWord = this.core;
                    sequence.stepsComplete += 1;
                    
                    // Check if sequence is complete
                    if (sequence.stepsComplete === sequence.categories.length) {
                        this.showCategoryFeedback('Sequence Complete! Bonus Energy!', true);
                        sequence.stepsComplete = 0;
                        sequence.current = null;
                    }
                }
            }
        }

        this.lastActivationTime = now;
        this.activationCount++;
        this.core.isActive = true; 

        if (this.core.element) {
            this.core.element.classList.add('active'); 
            this.applyActivationAnimation(); 
        }

        const centerX = this.core.x + this.core.radius;
        const centerY = this.core.y + this.core.radius;
        createSpecialEffect(this.core.id, centerX, centerY, this.core.colors.primary);

        const resonanceMultiplier = this.engine.resonanceSystem?.wordActivated(this.core) || 1; 
        const comboMultiplier = this.engine.comboSystem?.registerActivation() || 1;
        const skepticalBonus = this.engine.gameState.skepticalMethodActive ? 3 : 1;
        const chromaticBonus = (this.engine.gameState.chromaticBlindnessColor && this.core.epistemologicalSchool.toLowerCase() !== this.engine.gameState.chromaticBlindnessColor.toLowerCase()) ? 4 : 1;
        
        // Eternalism reduces energy by 40%
        const eternalismModifier = this.engine.gameState.eternalismActive ? 0.6 : 1;
        
        // Categorical Imperative completed sequence bonus
        const categoricalBonus = (this.engine.gameState.categoricalImperativeActive && 
                               this.engine.gameState.categoricalSequence.stepsComplete === 0) ? 3 : 1;
        
        const totalMultiplier = resonanceMultiplier * comboMultiplier * skepticalBonus * 
                              chromaticBonus * eternalismModifier * categoricalBonus;

        if (this.engine && typeof this.engine.addEnergy === 'function') {
            const energyGained = this.core.energyPotential * totalMultiplier;
            this.engine.addEnergy(energyGained);

            if (totalMultiplier > 1) this.showMultiplierEffect(totalMultiplier);
            this.createFloatingRewardParticles(centerX, centerY, Math.ceil(energyGained));

            this.engine.achievementSystem?.incrementAchievementProgress('word_activator');
        } else {
            console.warn(`Word ${this.core.id}: Engine or addEnergy function not available.`);
        }

        setTimeout(() => {
            this.core.isActive = false; 
            if (this.core.element) this.core.element.classList.remove('active');
        }, 1500); 
    }

    applyActivationAnimation() {
        if (!this.core.element) return;
        const currentTransform = this.core.element.style.transform || `translate(${this.core.x}px, ${this.core.y}px)`;
        this.core.element.animate([
            { transform: `${currentTransform} scale(1)` },
            { transform: `${currentTransform} scale(1.2)` },
            { transform: `${currentTransform} scale(1)` }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    }

    showCooldownFeedback() {
        if (!this.core.element) return;

        this.core.element.classList.add('cooldown-flash');
        setTimeout(() => {
            if (this.core.element) this.core.element.classList.remove('cooldown-flash');
        }, 300);
    }

    createFloatingRewardParticles(x, y, amount) {
        if (!this.core.container || amount <= 0) return; 
        const particleCount = Math.min(Math.ceil(amount / 5), 8); 

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
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
            particle.style.transform = 'translate(-50%, -50%)'; 

            this.core.container.appendChild(particle);

            const angle = (Math.random() * Math.PI) - (Math.PI/2); 
            const speed = 2 + Math.random() * 3; 

            particle.animate([
                { transform: 'translate(-50%, -50%)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * 100 - 50}px, ${Math.sin(angle) * 100 - 50}px) scale(${i === 0 ? 1.2 : 0.8})`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (this.core.container && this.core.container.contains(particle)) {
                    this.core.container.removeChild(particle);
                }
            };
        }
    }

    showMultiplierEffect(multiplier) {
        if (!this.core.container) return;
        const multiplierEl = document.createElement('div');
        multiplierEl.className = 'word-multiplier';
        multiplierEl.textContent = `×${multiplier.toFixed(1)}`;

        multiplierEl.style.position = 'absolute';
        multiplierEl.style.left = `${this.core.x + this.core.radius}px`; 
        multiplierEl.style.top = `${this.core.y - 20}px`; 
        multiplierEl.style.color = '#4caf50';
        multiplierEl.style.fontWeight = 'bold';
        multiplierEl.style.fontSize = '1.2em';
        multiplierEl.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        multiplierEl.style.pointerEvents = 'none';
        multiplierEl.style.zIndex = '200';
        multiplierEl.style.transform = 'translate(-50%, -50%)';

        this.core.container.appendChild(multiplierEl);

        multiplierEl.animate([
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -100%)' } 
        ], {
            duration: 1200,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.core.container && this.core.container.contains(multiplierEl)) {
                this.core.container.removeChild(multiplierEl);
            }
        };
    }

    applyImpulse(impulseX, impulseY) {
        if (this.engine.gameState.deterministicUniverseActive) return;

        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        } else {
            this.vx += impulseX * 10; 
            this.vy += impulseY * 10;
        }
    }

    updateResonanceVisuals() {
        if (!this.engine.resonanceSystem || !this.core.element || this.engine.gameState.currentScreen !== 'game' || !this.core.isVisible) {
            if (this.core.element) this.core.element.classList.remove('resonance-ready');
            return;
        }

        const canResonate = this.engine.resonanceSystem.canFormResonance(this.core);

        if (canResonate) {
            this.core.element.classList.add('resonance-ready');
        } else {
            this.core.element.classList.remove('resonance-ready');
        }
    }

    updateVisibility() {
        if (!this.engine || !this.core.element) return;

        const blindColor = this.engine.gameState.chromaticBlindnessColor;
        this.core.isVisible = !(blindColor && this.core.epistemologicalSchool.toLowerCase() === blindColor.toLowerCase());
        this.core.updateVisibilityStyle();
    }

    destroy(skipAnimation = false) {
        if (this.core.isBeingDestroyed) return;

        this.core.isBeingDestroyed = true;
        this.core.isVisible = false; 

        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            const index = this.engine.gameState.words.findIndex(word => word.id === this.core.id);
            if (index > -1) {
                this.engine.gameState.words.splice(index, 1);
            }
        }

        if (skipAnimation || !this.core.element || !this.core.container) {
            this.core.removeElement();
        } else {
            this.core.element.classList.add('destroy');
            this.core.element.style.pointerEvents = 'none';
            const currentTransform = this.core.element.style.transform || 'translate(0,0)';
            this.core.element.animate([
                { 
                    transform: `${currentTransform} scale(1)`, 
                    opacity: 1 
                },
                { 
                    transform: `${currentTransform} scale(0.5)`, 
                    opacity: 0 
                }
            ], {
                duration: 500,
                easing: 'ease-in'
            }).onfinish = () => {
                if (this.core.container && this.core.container.contains(this.core.element)) {
                    this.core.container.removeChild(this.core.element);
                }
                this.core.element = null;
            };
        }
    }

    showCategoryFeedback(message, isSuccess = false) {
        if (!this.core.container) return;
        
        const feedback = document.createElement('div');
        feedback.className = 'category-feedback';
        feedback.textContent = message;
        
        feedback.style.position = 'absolute';
        feedback.style.left = `${this.core.x + this.core.radius}px`;
        feedback.style.top = `${this.core.y - 30}px`;
        feedback.style.color = isSuccess ? '#4caf50' : '#f44336';
        feedback.style.fontWeight = 'bold';
        feedback.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        feedback.style.backgroundColor = 'rgba(0,0,0,0.7)';
        feedback.style.padding = '5px 10px';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '200';
        feedback.style.pointerEvents = 'none';
        feedback.style.transform = 'translate(-50%, -50%)';
        
        this.core.container.appendChild(feedback);
        
        feedback.animate([
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -100%)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.core.container.contains(feedback)) {
                this.core.container.removeChild(feedback);
            }
        };
    }
}