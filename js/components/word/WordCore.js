import { WORDS_DATA } from 'config/constants.js';

export class WordCore {
    constructor(data, container, engine) {
        this.engine = engine;
        this.container = container;

        // --- Core Data ---
        this.id = data.id;
        this.text = data.text;
        this.size = data.size;
        this.radius = this.size / 2;
        this.colors = data.colors;

        // Fetch full data including new categories
        const wordDefinition = WORDS_DATA.find(wd => wd.id === this.id) || data;
        this.baseEnergyPotential = wordDefinition.energyPotential || 0;
        this.energyPotential = this.baseEnergyPotential;
        this.description = wordDefinition?.description || this.text; // Store description

        // GDD properties
        this.ontologicalCategory = wordDefinition.ontologicalCategory || 'Meso';
        this.epistemologicalSchool = wordDefinition.epistemologicalSchool || 'Rationalism';
        this.methodologicalApproach = wordDefinition.methodologicalApproach || 'Analytical';

        // --- State ---
        this.x = 0;
        this.y = 0;
        this.isDragging = false;
        this.isBeingDestroyed = false;
        this.isActive = false; // Activation state (e.g., during the pop animation)
        this.isVisible = true; // Visibility state

        // --- DOM Element ---
        this.element = null;
        this.createElement();
        this.addTooltip();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        // Add classes based on new categories for potential styling
        this.element.className = `word word-ont-${this.ontologicalCategory.toLowerCase()} word-epi-${this.epistemologicalSchool.toLowerCase()} word-met-${this.methodologicalApproach.toLowerCase()}`;

        this.element.innerHTML = `<span>${this.text}</span>`;

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        this.element.style.position = 'absolute';
        this.element.style.left = '0px'; // Base position for transform origin
        this.element.style.top = '0px';  // Base position for transform origin

        // Initial position update
        this.updateElementPosition();

        if (this.container) {
             this.container.appendChild(this.element);
        } else {
            console.error(`Container not provided for word ${this.id}`);
        }
    }

    addTooltip() {
        if (!this.element) return;

        const descriptionEl = document.createElement('div');
        descriptionEl.className = 'word-description';
        descriptionEl.innerHTML = `
            ${this.description}<br>
            <span class="tooltip-category">[${this.ontologicalCategory}, ${this.epistemologicalSchool}, ${this.methodologicalApproach}]</span>
        `;
        this.element.appendChild(descriptionEl);
    }

    updateElementPosition() {
        // Ensure x and y are valid numbers before applying the transform
        if (this.element && !isNaN(this.x) && !isNaN(this.y)) {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        } else if (this.element) {
            // Fallback if position becomes invalid, log warning and reset
            console.warn(`Invalid position for word ${this.id}: (${this.x}, ${this.y}). Resetting to center.`);
            const containerRect = this.container?.getBoundingClientRect();
            this.x = containerRect ? (containerRect.width - this.size) / 2 : 0;
            this.y = containerRect ? (containerRect.height - this.size) / 2 : 0;
            // Reset velocity in behavior module if possible (requires reference or event)
            // For now, just reset position here.
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }

    // This method now only updates the style based on the state
    updateVisibilityStyle() {
         if (!this.element) return;
         this.element.style.display = this.isVisible ? 'flex' : 'none';
     }

    // Removes element from DOM without animation (called by WordBehavior.destroy)
    removeElement() {
        if (this.element && this.container && this.container.contains(this.element)) {
            this.container.removeChild(this.element);
        }
        this.element = null; // Nullify reference
    }
}