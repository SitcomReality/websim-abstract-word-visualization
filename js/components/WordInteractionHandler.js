import { createTrail } from 'components/Trail.js';
import { PHYSICS_CONFIG } from 'config/constants.js';

export class WordInteractionHandler {
    constructor(word, container, engine) {
        this.word = word;
        this.container = container;
        this.engine = engine; 

        this.isDragging = false;
        this.dragMoved = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    startDrag(e) {
        if (e.button && e.button !== 0) return;
        if (this.word.isBeingDestroyed) return; 

        this.isDragging = true;
        this.word.isDragging = true; 
        this.dragMoved = false;

        this.word.element.classList.add('dragging');
        this.word.element.style.zIndex = 100; 

        const clientX = e.clientX;
        const clientY = e.clientY;

        const rect = this.word.element.getBoundingClientRect();
        this.dragOffsetX = clientX - rect.left; 
        this.dragOffsetY = clientY - rect.top; 

        this.lastMouseX = clientX; 
        this.lastMouseY = clientY;

        this.word.vx = 0; 
        this.word.vy = 0;
    }

    drag(e) {
        if (!this.isDragging || this.word.isBeingDestroyed) return;

        const currentMouseX = e.clientX;
        const currentMouseY = e.clientY;

        const dx = currentMouseX - this.lastMouseX;
        const dy = currentMouseY - this.lastMouseY;

        if (!this.dragMoved && Math.sqrt(dx * dx + dy * dy) > 5) { 
            this.dragMoved = true;
        }

        let newX = currentMouseX - this.dragOffsetX;
        let newY = currentMouseY - this.dragOffsetY;

        this.word.vx = dx * PHYSICS_CONFIG.DRAG_THROW_FACTOR;
        this.word.vy = dy * PHYSICS_CONFIG.DRAG_THROW_FACTOR;

        const containerRect = this.container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.word.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.word.size;

        this.word.x = Math.max(leftBoundary, Math.min(newX, rightBoundary)); 
        this.word.y = Math.max(topBoundary, Math.min(newY, bottomBoundary));

        this.word.updateElementPosition();

        this.lastMouseX = currentMouseX;
        this.lastMouseY = currentMouseY;

        createTrail(this.word.x + this.word.radius, this.word.y + this.word.radius, this.word.element, this.container);
    }

    endDrag(e, cancelled = false) {
        if (!this.isDragging) return; 

        this.isDragging = false;
        this.word.isDragging = false; 
        if (this.word.element) { 
            this.word.element.classList.remove('dragging');
            this.word.element.style.zIndex = ''; 
        }

        if (cancelled || this.word.isBeingDestroyed) {
            this.word.vx = 0;
            this.word.vy = 0;
            this.dragMoved = false; 
            return;
        }

        if (!this.dragMoved) {
            this.word.vx = 0;
            this.word.vy = 0;
        } else {
            const speed = Math.sqrt(this.word.vx * this.word.vx + this.word.vy * this.word.vy);
            const maxThrowSpeed = this.word.maxSpeed * 2.5; 

            if (speed > maxThrowSpeed) {
                this.word.vx = (this.word.vx / speed) * maxThrowSpeed;
                this.word.vy = (this.word.vy / speed) * maxThrowSpeed;
            }

            this.checkForFusion();
        }

        this.dragMoved = false;
    }

    checkForFusion() {
        if (!this.engine || !this.engine.fusionSystem || !this.engine.gameState || !this.engine.gameState.words) {
            console.warn("Cannot check for fusion: required systems or state missing.");
            return;
        }

        const words = this.engine.gameState.words;
        const currentWord = this.word;
        const centerX = currentWord.x + currentWord.radius;
        const centerY = currentWord.y + currentWord.radius;

        for (const otherWord of words) {
            if (otherWord === currentWord || !otherWord.element || otherWord.isBeingDestroyed) continue;

            const otherCenterX = otherWord.x + otherWord.radius;
            const otherCenterY = otherWord.y + otherWord.radius;

            const dx = centerX - otherCenterX;
            const dy = centerY - otherCenterY;
            const distanceSq = dx * dx + dy * dy;

            const touchDistance = currentWord.radius + otherWord.radius + 10; 
            const touchDistanceSq = touchDistance * touchDistance;

            if (distanceSq < touchDistanceSq) {
                console.log(`Potential fusion detected between ${currentWord.id} and ${otherWord.id} on drag release.`);
                this.engine.fusionSystem.attemptFusion(currentWord, otherWord);
                break;
            }
        }
    }
}