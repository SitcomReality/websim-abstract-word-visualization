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

        const wordDefinition = WORDS_DATA.find(wd => wd.id === this.id);
        this.baseEnergyPotential = wordDefinition ? wordDefinition.energyPotential : 0;
        this.energyPotential = this.baseEnergyPotential;

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

        this.init();
        this.interactionHandler = new WordInteractionHandler(this, this.container, this.engine);
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'word';
        
        // Add description element
        const description = document.createElement('div');
        description.className = 'word-description';
        description.textContent = WORDS_DATA.find(w => w.id === this.id)?.description || this.text;
        
        this.element.innerHTML = `<span>${this.text}</span>`;
        this.element.appendChild(description);

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        this.element.style.position = 'absolute';
        this.element.style.left = '0px';
        this.element.style.top = '0px';
        this.element.style.transform = `translate(0px, 0px)`;

        this.container.appendChild(this.element);

        this.addEventListeners();
    }

    addEventListeners() {
        this.element.addEventListener('click', (e) => {
            if (!this.interactionHandler.dragMoved) {
                this.activate();
            }
        });

        this.element.addEventListener('mousedown', (e) => this.interactionHandler.startDrag(e));
        window.addEventListener('mousemove', (e) => this.interactionHandler.drag(e));
        window.addEventListener('mouseup', (e) => this.interactionHandler.endDrag(e));

        this.element.addEventListener('touchstart', (e) => {
            if (e.target === this.element || e.target.parentNode === this.element) {
                this.interactionHandler.startDrag(e.touches[0]);
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
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
        if (this.isDragging) return;

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

        let nextX = this.x + this.vx * dt;
        let nextY = this.y + this.vy * dt;

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
                this.x = Math.max(leftBoundary, Math.min(nextX, rightBoundary));
                this.vx *= -this.restitution;
            } else {
                this.x = nextX;
            }

            if (nextY < topBoundary || nextY > bottomBoundary) {
                this.y = Math.max(topBoundary, Math.min(nextY, bottomBoundary));
                this.vy *= -this.restitution;
            } else {
                this.y = nextY;
            }
        }

        this.updateElementPosition();
    }

    updateElementPosition() {
        if (!isNaN(this.x) && !isNaN(this.y)) {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        } else {
            console.warn(`Invalid position for word ${this.id}: (${this.x}, ${this.y}). Resetting to 0,0.`);
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            if (this.element) {
                this.element.style.transform = `translate(0px, 0px)`;
            }
        }
    }

    activate() {
        if (this.element.classList.contains('active') || this.isDragging || this.isBeingDestroyed) return;

        this.element.classList.add('active', 'dopamine-pop');
        
        // Remove animation class after it completes
        setTimeout(() => {
            if (this.element) this.element.classList.remove('dopamine-pop');
        }, 300);

        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);

        // Apply resonance multiplier if system exists
        let energyMultiplier = 1;
        if (this.engine.resonanceSystem) {
            energyMultiplier = this.engine.resonanceSystem.wordActivated(this);
        }
        
        // Apply combo system multiplier if it exists
        if (this.engine.comboSystem) {
            energyMultiplier *= this.engine.comboSystem.registerActivation();
        }

        if (this.engine && typeof this.engine.addEnergy === 'function') {
            const energyGained = this.energyPotential * energyMultiplier;
            this.engine.addEnergy(energyGained);
            
            // Show the multiplier if > 1
            if (energyMultiplier > 1) {
                this.showMultiplierEffect(energyMultiplier);
            }
            
            // Track word activations for achievements
            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.incrementAchievementProgress('word_activator');
            }
            
            // Add floating particles for extra visual feedback
            this.createFloatingRewardParticles(centerX, centerY, Math.ceil(energyGained));
        } else {
            console.warn(`Word ${this.id}: Engine or addEnergy function not available for energy harvesting.`);
        }

        setTimeout(() => {
            if (this.element && this.element.classList.contains('active')) {
                this.element.classList.remove('active');
            }
        }, 1500);
    }

    createFloatingRewardParticles(x, y, amount) {
        const particleCount = Math.min(Math.ceil(amount / 5), 8); // Scale particles with energy, max 8
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            particle.textContent = '+' + (i === 0 ? amount : '');
            
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
                    transform: `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100 - 50}px) scale(${i === 0 ? 1.2 : 0.8})`,
                    opacity: 0 
                }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (this.container.contains(particle)) {
                    this.container.removeChild(particle);
                }
            };
        }
    }

    showMultiplierEffect(multiplier) {
        const multiplierEl = document.createElement('div');
        multiplierEl.className = 'word-multiplier';
        multiplierEl.textContent = `×${multiplier.toFixed(1)}`;
        
        multiplierEl.style.position = 'absolute';
        multiplierEl.style.left = `${this.x + this.size/2}px`;
        multiplierEl.style.top = `${this.y - 20}px`;
        multiplierEl.style.color = '#4caf50';
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
            if (this.container.contains(multiplierEl)) {
                this.container.removeChild(multiplierEl);
            }
        };
    }

    applyImpulse(impulseX, impulseY) {
        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        } else {
            this.vx += impulseX;
            this.vy += impulseY;
        }
    }

    destroy(skipAnimation = false) {
        if (this.isBeingDestroyed) return;

        this.isBeingDestroyed = true;

        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            const index = this.engine.gameState.words.indexOf(this);
            if (index > -1) {
                this.engine.gameState.words.splice(index, 1);
            }
        }

        if (skipAnimation) {
            if (this.element && this.container.contains(this.element)) {
                this.container.removeChild(this.element);
            }
            this.element = null;
        } else {
            if (this.element) {
                this.element.classList.add('destroy');
                this.element.style.pointerEvents = 'none';
                this.element.animate([
                    { opacity: 1, transform: `${this.element.style.transform || 'translate(0,0)'} scale(1)` },
                    { opacity: 0, transform: `${this.element.style.transform || 'translate(0,0)'} scale(0.5)` }
                ], {
                    duration: 500,
                    easing: 'ease-in'
                }).onfinish = () => {
                    if (this.element && this.container.contains(this.element)) {
                        this.container.removeChild(this.element);
                    }
                    this.element = null;
                };
            }
        }
    }
}