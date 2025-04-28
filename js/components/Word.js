import { getRandomPosition } from 'utils/position.js';
import { createTrail } from 'components/Trail.js';
import { createSpecialEffect } from 'effects/effectManager.js';
import { PHYSICS_CONFIG, WORDS_DATA } from 'config/constants.js';

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
        this.energyPotential = wordDefinition ? wordDefinition.energyPotential : 0;

        this.x = 0;
        this.y = 0;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.damping = PHYSICS_CONFIG.DAMPING;
        this.pushForce = PHYSICS_CONFIG.PUSH_FORCE;
        this.maxSpeed = PHYSICS_CONFIG.MAX_SPEED;
        this.mass = Math.PI * this.radius * this.radius;
        this.restitution = PHYSICS_CONFIG.RESTITUTION_RANGE[0] + Math.random() * (PHYSICS_CONFIG.RESTITUTION_RANGE[1] - PHYSICS_CONFIG.RESTITUTION_RANGE[0]);

        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragMoved = false;

        this.init();
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'word';
        this.element.innerHTML = `<span>${this.text}</span>`;

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        this.element.style.position = 'absolute';
        this.element.style.left = '0px';
        this.element.style.top = '0px';
        this.element.style.transform = `translate(0px, 0px)`;

        this.container.appendChild(this.element);

        const initialPosition = getRandomPosition(this.element, this.container);
        this.x = initialPosition.x;
        this.y = initialPosition.y;
        this.updateElementPosition();

        this.addEventListeners();
    }

    addEventListeners() {
        this.element.addEventListener('click', (e) => {
            if (!this.dragMoved) {
                this.activate();
            }
            this.dragMoved = false;
        });

        this.element.addEventListener('mousedown', (e) => this.startDrag(e));
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', (e) => this.endDrag(e));
        this.element.addEventListener('touchstart', (e) => {
            this.startDrag(e.touches[0]);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.drag(e.touches[0]);
            }
        }, { passive: false });
        window.addEventListener('touchend', (e) => this.endDrag(e.changedTouches[0]));
        window.addEventListener('touchcancel', (e) => this.endDrag(e.changedTouches[0]));
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
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.size;

        if (nextX < leftBoundary) {
            this.x = leftBoundary;
            this.vx *= -this.restitution;
        } else if (nextX > rightBoundary) {
            this.x = rightBoundary;
            this.vx *= -this.restitution;
        } else {
            this.x = nextX;
        }

        if (nextY < topBoundary) {
            this.y = topBoundary;
            this.vy *= -this.restitution;
        } else if (nextY > bottomBoundary) {
            this.y = bottomBoundary;
            this.vy *= -this.restitution;
        } else {
            this.y = nextY;
        }

        this.updateElementPosition();
    }

    updateElementPosition() {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    activate() {
        if (this.element.classList.contains('active') || this.isDragging) return;

        this.element.classList.add('active');

        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);

        if (this.engine && typeof this.engine.addEnergy === 'function') {
            this.engine.addEnergy(this.energyPotential);
        } else {
            console.warn(`Word ${this.id}: Engine not available for energy harvesting.`);
        }

        setTimeout(() => {
            if (this.element && this.element.classList.contains('active')) {
                this.element.classList.remove('active');
            }
        }, 1500);
    }

    startDrag(e) {
        if (e.button && e.button !== 0) return;

        this.isDragging = true;
        this.dragMoved = false;

        this.element.classList.add('dragging');
        this.element.style.transition = 'none';

        const clientX = e.clientX;
        const clientY = e.clientY;
        this.dragOffsetX = clientX - (this.x + this.radius);
        this.dragOffsetY = clientY - (this.y + this.radius);
        this.vx = 0;
        this.vy = 0;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;

        this.element.style.zIndex = 100;
    }

    drag(e) {
        if (!this.isDragging) return;

        const currentMouseX = e.clientX;
        const currentMouseY = e.clientY;

        const dx = currentMouseX - this.lastMouseX;
        const dy = currentMouseY - this.lastMouseY;
        if (!this.dragMoved && Math.sqrt(dx * dx + dy * dy) > 3) {
            this.dragMoved = true;
        }

        let newCenterX = currentMouseX - this.dragOffsetX;
        let newCenterY = currentMouseY - this.dragOffsetY;

        this.vx = dx * PHYSICS_CONFIG.DRAG_THROW_FACTOR;
        this.vy = dy * PHYSICS_CONFIG.DRAG_THROW_FACTOR;

        this.x = newCenterX - this.radius;
        this.y = newCenterY - this.radius;

        const containerRect = this.container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.size;

        this.x = Math.max(leftBoundary, Math.min(this.x, rightBoundary));
        this.y = Math.max(topBoundary, Math.min(this.y, bottomBoundary));

        this.updateElementPosition();

        this.lastMouseX = currentMouseX;
        this.lastMouseY = currentMouseY;

        createTrail(this.x + this.radius, this.y + this.radius, this.element, this.container);
    }

    endDrag(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.classList.remove('dragging');
            this.element.style.zIndex = '';

            if (!this.dragMoved) {
                this.vx = 0;
                this.vy = 0;
                this.activate();
            } else {
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxThrowSpeed = this.maxSpeed * 3;
                if (speed > maxThrowSpeed) {
                    this.vx = (this.vx / speed) * maxThrowSpeed;
                    this.vy = (this.vy / speed) * maxThrowSpeed;
                }
                
                // Check for fusion with other words
                this.checkForFusion();
            }
        }
        this.dragMoved = false;
    }

    checkForFusion() {
        if (!this.engine) return;
        
        const words = this.engine.gameState.words;
        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        
        for (const otherWord of words) {
            if (otherWord === this) continue;
            
            const otherCenterX = otherWord.x + otherWord.radius;
            const otherCenterY = otherWord.y + otherWord.radius;
            
            const dx = centerX - otherCenterX;
            const dy = centerY - otherCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If words are very close, attempt fusion
            if (distance < this.radius + otherWord.radius + 10) {
                this.attemptFusion(otherWord);
                break;
            }
        }
    }
    
    attemptFusion(otherWord) {
        // Calculate fusion affinity based on word properties
        const affinityScore = Math.random(); // Simplified - could be based on word properties
        const energyCost = 5; // Energy required for fusion attempt
        
        if (affinityScore > 0.3 && this.engine.currentEnergy >= energyCost) {
            this.engine.addEnergy(-energyCost); // Subtract energy cost
            
            // Visual effect at fusion point
            const fusionX = (this.x + this.radius + otherWord.x + otherWord.radius) / 2;
            const fusionY = (this.y + this.radius + otherWord.y + otherWord.radius) / 2;
            
            // Create fusion effect
            const fusionColor = this.blendColors(this.colors.primary, otherWord.colors.primary);
            createSpecialEffect('fusion', fusionX, fusionY, fusionColor, 30);
            
            // Show fusion message
            this.showFusionMessage(this.text, otherWord.text, fusionX, fusionY);
            
            // Random chance to generate a new word from fusion
            if (Math.random() > 0.7) {
                this.createFusionWord(otherWord, fusionX, fusionY, fusionColor);
            }
        }
    }
    
    createFusionWord(otherWord, x, y, color) {
        if (!this.engine) return;
        
        // Generate fusion word properties
        const fusionText = this.generateFusionName(this.text, otherWord.text);
        const fusionSize = (this.size + otherWord.size) / 2 * (0.8 + Math.random() * 0.4);
        const energyBonus = Math.ceil((this.energyPotential + otherWord.energyPotential) * 0.6);
        
        // Create fusion word data
        const fusionData = {
            id: 'fusion_' + Date.now(),
            text: fusionText,
            size: fusionSize,
            colors: {
                primary: color,
                secondary: this.blendColors(this.colors.secondary, otherWord.colors.secondary)
            },
            energyPotential: energyBonus
        };
        
        // Create and add the new word
        const fusionWord = new Word(fusionData, this.container, this.engine);
        fusionWord.x = x - fusionWord.radius;
        fusionWord.y = y - fusionWord.radius;
        fusionWord.updateElementPosition();
        
        // Add to engine word list
        this.engine.gameState.words.push(fusionWord);
        
        // Award bonus energy for successful fusion
        this.engine.addEnergy(10);
    }
    
    generateFusionName(word1, word2) {
        // Simple fusion name generation
        const parts1 = word1.split(' ');
        const parts2 = word2.split(' ');
        
        if (parts1.length > 1 && parts2.length > 1) {
            return `${parts1[0]} ${parts2[1]}`;
        } else if (parts1.length > 1) {
            return `${parts1[0]} ${parts2[0]}`;
        } else if (parts2.length > 1) {
            return `${parts1[0]} ${parts2[1]}`;
        } else {
            // Combine parts of words
            const prefix = parts1[0].substring(0, Math.ceil(parts1[0].length / 2));
            const suffix = parts2[0].substring(Math.floor(parts2[0].length / 2));
            return prefix + suffix;
        }
    }
    
    blendColors(color1, color2) {
        // Convert hex to RGB, blend, convert back to hex
        const parseColor = (hexColor) => {
            const hex = hexColor.slice(1);
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        };
        
        const c1 = parseColor(color1);
        const c2 = parseColor(color2);
        
        const blend = {
            r: Math.floor((c1.r + c2.r) / 2),
            g: Math.floor((c1.g + c2.g) / 2),
            b: Math.floor((c1.b + c2.b) / 2)
        };
        
        return `#${blend.r.toString(16).padStart(2, '0')}${blend.g.toString(16).padStart(2, '0')}${blend.b.toString(16).padStart(2, '0')}`;
    }
    
    showFusionMessage(word1, word2, x, y) {
        const message = document.createElement('div');
        message.innerText = `${word1} + ${word2}`;
        message.style.position = 'absolute';
        message.style.left = `${x}px`;
        message.style.top = `${y}px`;
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#ffffff';
        message.style.fontWeight = 'bold';
        message.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        message.style.pointerEvents = 'none';
        message.style.zIndex = '200';
        this.container.appendChild(message);
        
        // Animate and remove
        message.animate([
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -120%)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.container.contains(message)) {
                this.container.removeChild(message);
            }
        };
    }
    
    applyImpulse(impulseX, impulseY) {
        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        }
    }
}