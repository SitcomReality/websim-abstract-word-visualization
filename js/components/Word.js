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
            if (e.target === this.element || e.target.parentNode === this.element) {
                this.startDrag(e.touches[0]);
            }
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault(); 
                this.drag(e.touches[0]);
            }
        }, { passive: false }); 
        window.addEventListener('touchend', (e) => {
            if (this.isDragging) { 
                this.endDrag(e.changedTouches[0]);
            }
        });
        window.addEventListener('touchcancel', (e) => {
            if (this.isDragging) {
                this.endDrag(e.changedTouches[0], true); 
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
            this.element.style.transform = `translate(0px, 0px)`;
        }
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
            console.warn(`Word ${this.id}: Engine or addEnergy function not available for energy harvesting.`);
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
        this.element.style.zIndex = 100; 

        const clientX = e.clientX;
        const clientY = e.clientY;

        const rect = this.element.getBoundingClientRect();
        this.dragOffsetX = clientX - rect.left; 
        this.dragOffsetY = clientY - rect.top; 

        this.vx = 0; 
        this.vy = 0;
        this.lastMouseX = clientX; 
        this.lastMouseY = clientY;
    }

    drag(e) {
        if (!this.isDragging) return;

        const currentMouseX = e.clientX;
        const currentMouseY = e.clientY;

        const dx = currentMouseX - this.lastMouseX;
        const dy = currentMouseY - this.lastMouseY;

        if (!this.dragMoved && Math.sqrt(dx * dx + dy * dy) > 5) { 
            this.dragMoved = true;
        }

        let newX = currentMouseX - this.dragOffsetX;
        let newY = currentMouseY - this.dragOffsetY;

        this.vx = dx * PHYSICS_CONFIG.DRAG_THROW_FACTOR;
        this.vy = dy * PHYSICS_CONFIG.DRAG_THROW_FACTOR;

        const containerRect = this.container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.size;

        this.x = Math.max(leftBoundary, Math.min(newX, rightBoundary));
        this.y = Math.max(topBoundary, Math.min(newY, bottomBoundary));

        this.updateElementPosition();

        this.lastMouseX = currentMouseX;
        this.lastMouseY = currentMouseY;

        createTrail(this.x + this.radius, this.y + this.radius, this.element, this.container);
    }

    endDrag(e, cancelled = false) {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.classList.remove('dragging');
            this.element.style.zIndex = ''; 

            if (!this.dragMoved && !cancelled) {
                this.vx = 0; 
                this.vy = 0;
                this.activate(); 
            } else if (!cancelled) { 
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxThrowSpeed = this.maxSpeed * 2.5; 
                if (speed > maxThrowSpeed) {
                    this.vx = (this.vx / speed) * maxThrowSpeed;
                    this.vy = (this.vy / speed) * maxThrowSpeed;
                }
                
                this.checkForFusion();
            } else {
                this.vx = 0;
                this.vy = 0;
            }
        }
        this.dragMoved = false;
    }

    checkForFusion() {
        if (!this.engine || !this.engine.gameState || !this.engine.gameState.words) {
            console.warn("Cannot check for fusion: engine or words list missing.");
            return;
        }

        const words = this.engine.gameState.words;
        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;

        for (const otherWord of words) {
            if (otherWord === this || !otherWord.element || otherWord.isBeingDestroyed) continue; 

            const otherCenterX = otherWord.x + otherWord.radius;
            const otherCenterY = otherWord.y + otherWord.radius;

            const dx = centerX - otherCenterX;
            const dy = centerY - otherCenterY;
            const distanceSq = dx * dx + dy * dy; 
            const touchDistance = this.radius + otherWord.radius + 5; 
            const touchDistanceSq = touchDistance * touchDistance;

            if (distanceSq < touchDistanceSq) {
                console.log(`Potential fusion detected between ${this.id} and ${otherWord.id}`);
                this.attemptFusion(otherWord);
            }
        }
    }

    attemptFusion(otherWord) {
        if (!this.engine) return;

        const baseAffinity = 0.4; 
        const affinityScore = Math.random() * (this.engine.fusionSuccessRateModifier || 1);
        const energyCost = 15; 
        const fusionThreshold = 1 - baseAffinity; 

        console.log(`Attempting fusion: Affinity Roll ${affinityScore.toFixed(2)} vs Threshold ${fusionThreshold.toFixed(2)}, Cost ${energyCost}, Energy ${this.engine.currentEnergy}`);

        if (affinityScore > fusionThreshold && this.engine.currentEnergy >= energyCost) {
            this.engine.addEnergy(-energyCost); 

            const fusionX = (this.x + this.radius + otherWord.x + otherWord.radius) / 2;
            const fusionY = (this.y + this.radius + otherWord.y + otherWord.radius) / 2;

            const fusionColor = this.blendColors(this.colors.primary, otherWord.colors.primary);

            createSpecialEffect('fusion', fusionX, fusionY, fusionColor, 30);

            this.showFusionMessage(this.text, otherWord.text, fusionX, fusionY);

            const createNewWordChance = 0.6; 
            if (Math.random() < createNewWordChance) {
                console.log("Fusion successful: Creating new word.");
                this.createFusionWord(otherWord, fusionX, fusionY, fusionColor);
                this.destroy();
                otherWord.destroy();
            } else {
                console.log("Fusion successful: Granting bonus energy.");
                this.engine.addEnergy(25); 
                const pushForce = 5;
                const angle = Math.atan2(this.y - otherWord.y, this.x - otherWord.x);
                this.applyImpulse(Math.cos(angle) * pushForce, Math.sin(angle) * pushForce);
                otherWord.applyImpulse(-Math.cos(angle) * pushForce, -Math.sin(angle) * pushForce);
            }

        } else {
            console.log("Fusion failed (low affinity or insufficient energy).");
            const pushForce = 2;
            const angle = Math.atan2(this.y - otherWord.y, this.x - otherWord.x);
            this.applyImpulse(Math.cos(angle) * pushForce, Math.sin(angle) * pushForce);
            otherWord.applyImpulse(-Math.cos(angle) * pushForce, -Math.sin(angle) * pushForce);
        }
    }

    createFusionWord(otherWord, x, y, color) {
        if (!this.engine || !this.engine.wordManager) return;

        const fusionText = this.generateFusionName(this.text, otherWord.text);
        const fusionSize = Math.max(60, Math.min(200, (this.size + otherWord.size) / 2 * (0.9 + Math.random() * 0.2))); 
        const energyBonus = Math.ceil((this.energyPotential + otherWord.energyPotential) * 0.75); 

        const fusionData = {
            id: `fusion_${this.id}_${otherWord.id}_${Date.now()}`.slice(0, 50), 
            text: fusionText,
            size: fusionSize,
            colors: {
                primary: color,
                secondary: this.blendColors(this.colors.secondary, otherWord.colors.secondary)
            },
            energyPotential: energyBonus 
        };

        const fusionWord = this.engine.wordManager.createAndAddWord(fusionData, this.container, true); 

        if (fusionWord) {
            fusionWord.x = x - fusionWord.radius;
            fusionWord.y = y - fusionWord.radius;
            fusionWord.vx = (Math.random() - 0.5) * 2;
            fusionWord.vy = (Math.random() - 0.5) * 2;
            fusionWord.updateElementPosition();

            this.engine.addEnergy(50); 
            console.log(`Created fusion word: ${fusionWord.id} (${fusionWord.text})`);
        } else {
            console.error("Failed to create fusion word instance.");
        }
    }

    generateFusionName(word1, word2) {
        const parts1 = word1.split(' ');
        const parts2 = word2.split(' ');
        const w1 = parts1[0]; 
        const w2 = parts2[0];

        const methods = [
            () => `${w1.substring(0, Math.ceil(w1.length / 2))}${w2.substring(Math.floor(w2.length / 2))}`, 
            () => `${w2.substring(0, Math.ceil(w2.length / 2))}${w1.substring(Math.floor(w1.length / 2))}`, 
            () => `${w1.slice(0, 3)}${w2.slice(-3)}`, 
            () => `${w1}-${w2}`.substring(0,15), 
        ];

        const chosenMethod = methods[Math.floor(Math.random() * methods.length)];
        let fusedName = chosenMethod();

        fusedName = fusedName.charAt(0).toUpperCase() + fusedName.slice(1);

        if (parts1.length > 1 && parts2.length > 1 && Math.random() > 0.5) {
            const descriptor = Math.random() > 0.5 ? parts1[1] : parts2[1];
            fusedName += ` ${descriptor}`;
        } else if (parts1.length > 1 && Math.random() > 0.3) {
            fusedName += ` ${parts1[1]}`;
        } else if (parts2.length > 1 && Math.random() > 0.3) {
            fusedName += ` ${parts2[1]}`;
        }

        return fusedName.substring(0, 25); 
    }

    blendColors(color1, color2) {
        try {
            const parseColor = (hexColor) => {
                if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
                    return { r: 128, g: 128, b: 128 }; 
                }
                const hex = hexColor.slice(1);
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (isNaN(r) || isNaN(g) || isNaN(b)) {
                    return { r: 128, g: 128, b: 128 };
                }
                return { r, g, b };
            };

            const c1 = parseColor(color1);
            const c2 = parseColor(color2);

            const blend = {
                r: Math.floor((c1.r + c2.r) / 2),
                g: Math.floor((c1.g + c2.g) / 2),
                b: Math.floor((c1.b + c2.b) / 2)
            };

            const toHex = (c) => c.toString(16).padStart(2, '0');
            return `#${toHex(blend.r)}${toHex(blend.g)}${toHex(blend.b)}`;

        } catch (error) {
            console.error("Error blending colors:", color1, color2, error);
            return '#ffffff'; 
        }
    }

    showFusionMessage(word1, word2, x, y) {
        const message = document.createElement('div');
        message.innerText = `${word1.split(' ')[0]} + ${word2.split(' ')[0]}`; 

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

    destroy() {
        this.element.classList.add('destroy');
        this.isBeingDestroyed = true;
        setTimeout(() => {
            this.container.removeChild(this.element);
        }, 1000);
    }
}