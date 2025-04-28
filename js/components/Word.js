import { WordCore } from './word/WordCore.js';
import { WordInteractionHandler } from './WordInteractionHandler.js';
import { WordPhysics } from './word/WordPhysics.js';
import { WordActivation } from './word/WordActivation.js';
import { WordFeedback } from './word/WordFeedback.js';
import { WordLifecycle } from './word/WordLifecycle.js';

export class Word {
    constructor(data, container, engine) {
        this.core = new WordCore(data, container, engine);
        this.physics = new WordPhysics(this.core, engine);
        this.feedback = new WordFeedback(this.core, engine, this.physics);
        this.activation = new WordActivation(this.core, engine, this.physics, this.feedback);
        this.lifecycle = new WordLifecycle(this.core, engine);
        this.interactionHandler = new WordInteractionHandler(this, container, engine);

        this.core.wordInstance = this;
        this.core.physics = this.physics;

        this.addEventListeners();

        this.updateVisibility();
    }

    get id() { return this.core.id; }
    get text() { return this.core.text; }
    get size() { return this.core.size; }
    get radius() { return this.core.radius; }
    get colors() { return this.core.colors; }
    get x() { return this.core.x; }
    set x(value) { this.core.x = value; }
    get y() { return this.core.y; }
    set y(value) { this.core.y = value; }
    get vx() { return this.physics.vx; }
    set vx(value) { this.physics.vx = value; }
    get vy() { return this.physics.vy; }
    set vy(value) { this.physics.vy = value; }
    get mass() { return this.physics.mass; }
    set restitution(value) { this.physics.restitution = value; }
    get restitution() { return this.physics.restitution; }
    get element() { return this.core.element; }
    get isDragging() { return this.core.isDragging; }
    set isDragging(value) { this.core.isDragging = value; }
    get isBeingDestroyed() { return this.core.isBeingDestroyed; }
    get isVisible() { return this.core.isVisible; }
    get energyPotential() { return this.core.energyPotential; }
    set energyPotential(value) { this.core.energyPotential = value; }
    get baseEnergyPotential() { return this.core.baseEnergyPotential; }
    set baseEnergyPotential(value) { this.core.baseEnergyPotential = value; }
    get epistemologicalSchool() { return this.core.epistemologicalSchool; }
    get engine() { return this.core.engine; }
    get container() { return this.core.container; }
    get maxSpeed() { return this.physics.maxSpeed; }
    get ontologicalCategory() { return this.core.ontologicalCategory; }

    addEventListeners() {
        if (!this.core.element) return;

        const handleInteraction = (handlerFn, event) => {
            if (!this.core.isVisible || this.core.isBeingDestroyed) return;
            handlerFn.call(this.interactionHandler, event);
        };

        const handleActivation = (event) => {
            if (!this.core.isVisible || this.core.isBeingDestroyed || this.interactionHandler.dragMoved) return;
            if (event.target === this.core.element || event.target.parentNode === this.core.element) {
                this.activate();
            }
        }

        this.core.element.addEventListener('mousedown', (e) => handleInteraction(this.interactionHandler.startDrag, e));
        this.core.element.addEventListener('click', handleActivation);

        const touchStartHandler = (e) => {
            if (e.target === this.core.element || e.target.parentNode === this.core.element) {
                e.preventDefault();
                handleInteraction(this.interactionHandler.startDrag, e.touches[0]);
            }
        };

        const touchEndHandler = (e) => {
            if (this.interactionHandler.isDragging) {
                if (!this.interactionHandler.dragMoved) {
                    this.activate();
                }
                handleInteraction(this.interactionHandler.endDrag, e.changedTouches[0]);
            }
        };

        this.core.element.addEventListener('touchstart', touchStartHandler, { passive: false });
        document.addEventListener('touchend', touchEndHandler);
        document.addEventListener('touchcancel', touchEndHandler);

        this.core.eventListeners = {
            touchstart: touchStartHandler,
            touchend: touchEndHandler,
            touchcancel: touchEndHandler
        };
    }

    update(dt = 1) {
        if (this.core.isBeingDestroyed) return;
        this.physics.updatePhysics(dt);
        this.feedback.updateResonanceVisuals();
        this.core.updateElementPosition();
    }

    activate() {
        this.activation.activate();
    }

    destroy(skipAnimation = false) {
        if (this.core.eventListeners) {
            document.removeEventListener('touchend', this.core.eventListeners.touchend);
            document.removeEventListener('touchcancel', this.core.eventListeners.touchcancel);
        }
        this.lifecycle.destroy(skipAnimation);
    }

    applyImpulse(impulseX, impulseY) {
        this.physics.applyImpulse(impulseX, impulseY);
    }

    updateElementPosition() {
        this.core.updateElementPosition();
    }

    updateResonanceVisuals() {
        this.feedback.updateResonanceVisuals();
    }

    updateVisibility() {
        this.lifecycle.updateVisibility(this.interactionHandler);
    }
}