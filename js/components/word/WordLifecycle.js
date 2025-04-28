export class WordLifecycle {
    constructor(core, engine) {
        this.core = core;
        this.engine = engine;
    }

    // Updates visibility based on game state (e.g., Chromatic Blindness)
    updateVisibility(interactionHandler) {
        const blindColor = this.engine.gameState.chromaticBlindnessColor;
        const isBlind = blindColor && this.core.epistemologicalSchool.toLowerCase() === blindColor.toLowerCase();

        this.core.isVisible = !isBlind;
        this.core.updateVisibilityStyle(); // Update the display style

        // Ensure interaction handlers are correctly enabled/disabled
        if (!this.core.isVisible && interactionHandler?.isDragging) {
            interactionHandler.endDrag(null, true); // Cancel drag if it becomes invisible
        }
        // If the element exists, toggle pointer events based on visibility
        if(this.core.element) {
            this.core.element.style.pointerEvents = this.core.isVisible ? 'auto' : 'none';
        }
    }

    // Handles the destruction of the word, including animation and cleanup
    destroy(skipAnimation = false) {
        if (this.core.isBeingDestroyed) return;

        this.core.isBeingDestroyed = true;
        this.core.isVisible = false; // Mark as not visible immediately

        // Stop any physics movement
        if (this.core.physics) {
            this.core.physics.vx = 0;
            this.core.physics.vy = 0;
        }

        // Remove from active game state words list
        const index = this.engine.gameState.words.indexOf(this.core.wordInstance); // Assumes core has ref back to Word instance
        if (index > -1) {
            this.engine.gameState.words.splice(index, 1);
        }

        // Clear any active resonance visuals related to this word
        if (this.engine.resonanceSystem) {
            this.engine.resonanceSystem.clearConnectionsForWord(this.core.wordInstance);
        }


        if (!this.core.element || skipAnimation) {
            this.core.removeElement();
            return;
        }

        // Apply destruction animation
        this.core.element.classList.add('destroying');
        this.core.element.style.pointerEvents = 'none'; // Disable interactions during destruction

        this.core.element.animate([
            { transform: `${this.core.element.style.transform} scale(1)`, opacity: 1 },
            { transform: `${this.core.element.style.transform} scale(0.1)`, opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-in'
        }).onfinish = () => {
            this.core.removeElement();
        };
    }
}