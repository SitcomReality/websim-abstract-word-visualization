import { WordCore } from './word/WordCore.js';
import { WordBehavior } from './word/WordBehavior.js';
import { WordInteractionHandler } from './WordInteractionHandler.js';

export class Word {
    constructor(data, container, engine) {
        this.core = new WordCore(data, container, engine);
        this.behavior = new WordBehavior(this.core, engine);
        this.interactionHandler = new WordInteractionHandler(this, container, engine); // Pass the main Word instance

        this.addEventListeners();

        // Initial visibility check based on engine state
        this.behavior.updateVisibility(); // Moved call here after core/behavior init
    }

    // --- Public Accessors ---
    // Provide access to core properties needed externally
    get id() { return this.core.id; }
    get text() { return this.core.text; }
    get size() { return this.core.size; }
    get radius() { return this.core.radius; }
    get colors() { return this.core.colors; }
    get x() { return this.core.x; }
    set x(value) { this.core.x = value; }
    get y() { return this.core.y; }
    set y(value) { this.core.y = value; }
    get vx() { return this.behavior.vx; }
    set vx(value) { this.behavior.vx = value; }
    get vy() { return this.behavior.vy; }
    set vy(value) { this.behavior.vy = value; }
    get mass() { return this.behavior.mass; }
    get restitution() { return this.behavior.restitution; }
    set restitution(value) { this.behavior.restitution = value; }
    get element() { return this.core.element; }
    get isDragging() { return this.core.isDragging; }
    set isDragging(value) { this.core.isDragging = value; } // Needed by InteractionHandler
    get isBeingDestroyed() { return this.core.isBeingDestroyed; }
    get isVisible() { return this.core.isVisible; }
    get energyPotential() { return this.core.energyPotential; }
    set energyPotential(value) { this.core.energyPotential = value; }
    get baseEnergyPotential() { return this.core.baseEnergyPotential; }
    set baseEnergyPotential(value) { this.core.baseEnergyPotential = value; } // Needed for upgrades
    get epistemologicalSchool() { return this.core.epistemologicalSchool; }
    get engine() { return this.core.engine; } // Needed by InteractionHandler & Behavior
    get container() { return this.core.container; } // Needed by InteractionHandler
    get maxSpeed() { return this.behavior.maxSpeed; } // Needed by InteractionHandler


    // --- Core Methods ---

    addEventListeners() {
        if (!this.core.element) return;

        // Prevent interaction if not visible or being destroyed
        const handleInteraction = (handlerFn, event) => {
            if (!this.core.isVisible || this.core.isBeingDestroyed) return;
            handlerFn.call(this.interactionHandler, event);
        };

        const handleActivation = (event) => {
            if (!this.core.isVisible || this.core.isBeingDestroyed) return;
            // Check dragMoved on the interactionHandler instance
            if (!this.interactionHandler.dragMoved) {
                this.activate(); // Call the main Word activate method
            }
        }

        this.core.element.addEventListener('click', handleActivation);
        this.core.element.addEventListener('mousedown', (e) => handleInteraction(this.interactionHandler.startDrag, e));

        this.core.element.addEventListener('touchstart', (e) => {
             if (e.target === this.core.element || e.target.parentNode === this.core.element) {
                 handleInteraction(this.interactionHandler.startDrag, e.touches[0]);
             }
         }, { passive: false });

        // Window listeners remain managed by WordInteractionHandler
    }

    // --- Delegated Methods ---

    update(dt = 1) {
        this.behavior.updatePhysics(dt);
    }

    activate() {
        this.behavior.activate();
    }

    destroy(skipAnimation = false) {
        this.behavior.destroy(skipAnimation);
    }

    applyImpulse(impulseX, impulseY) {
        this.behavior.applyImpulse(impulseX, impulseY);
    }

    updateElementPosition() {
        this.core.updateElementPosition();
    }

    updateResonanceVisuals() {
        this.behavior.updateResonanceVisuals();
    }

    // Method to update visibility based on engine state (e.g., Chromatic Blindness)
    updateVisibility() {
         this.behavior.updateVisibility();
         // If becoming invisible while dragging, cancel drag via interaction handler
         if (!this.core.isVisible && this.core.isDragging) {
             this.interactionHandler.endDrag(null, true); // Cancel drag
         }
     }
}