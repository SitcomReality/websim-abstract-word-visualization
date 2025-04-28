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
            }
        }
        this.dragMoved = false;
    }

    applyImpulse(impulseX, impulseY) {
        if (this.mass > 0.01) {
            this.vx += impulseX / this.mass;
            this.vy += impulseY / this.mass;
        }
    }
}