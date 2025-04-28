import { WordCore } from './word/WordCore.js';
import { WordInteractionHandler } from './WordInteractionHandler.js';
import { WordPhysics } from './word/WordPhysics.js';
import { WordActivation } from './word/WordActivation.js';
import { WordFeedback } from './word/WordFeedback.js';
import { WordLifecycle } from './word/WordLifecycle.js';
import { WORDS_DATA } from 'config/constants.js'; // Needed for Reductionist Toolkit fragment creation

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

        // Check if reductionist toolkit is already active when this word is created
        if (this.core.engine.gameState.reductionistToolkitActive) {
            this.addDoubleClickListener();
        }
    }

    // --- Getters/Setters delegate to core/physics ---
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
                 // Prevent activation if double-click is possible and active
                if (this.core.engine.gameState.reductionistToolkitActive && this.core.doubleClickListenerRef) {
                    // We might need a short delay to distinguish click from dblclick
                    // For now, let's assume dblclick listener handles prevention if needed
                } else {
                    this.activate();
                }
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
                    // Check if double-tap occurred (simplistic check)
                    const now = Date.now();
                    const tapTime = now - (this.core.lastTapTime || 0);
                    if (tapTime < 300 && this.core.engine.gameState.reductionistToolkitActive) {
                         this.handleDoubleClick(); // Treat as double-tap
                         this.core.lastTapTime = 0; // Reset tap time
                    } else {
                        this.activate(); // Treat as single tap (click)
                        this.core.lastTapTime = now;
                    }
                }
                handleInteraction(this.interactionHandler.endDrag, e.changedTouches[0]);
            } else {
                 // Handle tap without drag (if needed, might conflict with click)
            }
        };

        this.core.element.addEventListener('touchstart', touchStartHandler, { passive: false });
        document.addEventListener('touchend', touchEndHandler);
        document.addEventListener('touchcancel', touchEndHandler);

        this.core.eventListeners = {
            mousedown: (e) => handleInteraction(this.interactionHandler.startDrag, e),
            click: handleActivation,
            touchstart: touchStartHandler,
            touchend: touchEndHandler,
            touchcancel: touchEndHandler
            // Note: mousemove/mouseup are handled globally in Engine/main script usually
        };
    }

    addDoubleClickListener() {
        if (!this.core.element || this.core.doubleClickListenerRef) return; // Already added

        const listener = (e) => {
            if (!this.core.isVisible || this.core.isBeingDestroyed) return;
            e.preventDefault(); // Prevent potential default double-click behaviors
            this.handleDoubleClick();
        };

        this.core.element.addEventListener('dblclick', listener);
        this.core.doubleClickListenerRef = listener; // Store reference for removal
        console.log(`Added double-click listener to ${this.id}`);
    }

    removeDoubleClickListener() {
        if (!this.core.element || !this.core.doubleClickListenerRef) return; // Nothing to remove

        this.core.element.removeEventListener('dblclick', this.core.doubleClickListenerRef);
        this.core.doubleClickListenerRef = null; // Clear reference
        console.log(`Removed double-click listener from ${this.id}`);
    }

    handleDoubleClick() {
        console.log(`Double-click detected on ${this.id}`);
        // Reductionist Toolkit Logic: Break the word if applicable
        if (this.core.engine.gameState.reductionistToolkitActive) {
            // No category restriction on double-click breakdown (GDD implies only activation restriction)
            // if (this.ontologicalCategory === 'Macro') { // Uncomment this line to restrict breakdown to Macro only

            // Find a "Micro" template (e.g., 'kairos')
            const microTemplate = WORDS_DATA.find(w => w.ontologicalCategory === 'Micro') || WORDS_DATA[0]; // Fallback to first word if no micro

            if (!microTemplate) {
                console.error("Cannot perform reduction: No Micro word template found in WORDS_DATA.");
                return;
            }

            const centerX = this.x + this.radius;
            const centerY = this.y + this.radius;
            const numFragments = 3;
            const fragmentRadius = 30; // Spawn radius for fragments

            console.log(`Breaking down ${this.id} into ${numFragments} fragments.`);

            for (let i = 0; i < numFragments; i++) {
                const angle = (i / numFragments) * Math.PI * 2;
                const spawnX = centerX + Math.cos(angle) * fragmentRadius - microTemplate.size / 2;
                const spawnY = centerY + Math.sin(angle) * fragmentRadius - microTemplate.size / 2;

                // Create fragment data, inheriting school/methodology? Or use template's? Let's use template's for now.
                const fragmentData = {
                    ...microTemplate, // Copy base template
                    id: `fragment_${this.id}_${i}_${Date.now()}`.slice(0,50), // Unique ID
                    text: `${this.text.slice(0,3)} Frag.`, // Simple text indicator
                    // Optionally inherit color or keep template's color
                    colors: this.colors // Inherit color from parent
                };

                const newWord = this.engine.wordManager.createAndAddWord(fragmentData, this.container);
                if (newWord) {
                    newWord.x = spawnX;
                    newWord.y = spawnY;
                    newWord.vx = Math.cos(angle) * 1.5; // Push fragments outwards slightly
                    newWord.vy = Math.sin(angle) * 1.5;
                    newWord.updateElementPosition();
                }
            }

            // Destroy the original word immediately after spawning fragments
            this.destroy(true); // Skip animation for instant replacement

            // } else {
            //     console.log(`Reductionist Toolkit: ${this.id} (${this.ontologicalCategory}) cannot be broken down.`);
            // } // End category check block
        }
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
        this.removeDoubleClickListener(); // Ensure listener is removed on destruction

        if (this.core.eventListeners) {
            // Remove document-level listeners specifically
            document.removeEventListener('touchend', this.core.eventListeners.touchend);
            document.removeEventListener('touchcancel', this.core.eventListeners.touchcancel);
            // Element-specific listeners are removed when the element is destroyed
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