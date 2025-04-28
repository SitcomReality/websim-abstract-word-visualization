import { getRandomPosition } from 'utils/position.js';
import { createTrail } from 'components/Trail.js';
import { PHYSICS_CONFIG, WORDS_DATA } from 'config/constants.js';
import { WordInteractionHandler } from 'components/WordInteractionHandler.js';
import { WordRenderer } from 'components/WordRenderer.js';
import { WordPhysics } from 'components/WordPhysics.js';
import { WordActivation } from 'components/WordActivation.js';
import { WordEffects } from 'components/WordEffects.js';

export class Word {
    constructor(data, container, engine) {
        this.id = data.id;
        this.text = data.text;
        this.size = data.size;
        this.radius = this.size / 2;
        this.colors = data.colors;
        this.container = container;
        this.engine = engine;

        const wordDefinition = WORDS_DATA.find(wd => wd.id === this.id) || data;
        this.baseEnergyPotential = wordDefinition.energyPotential || 0;
        this.energyPotential = this.baseEnergyPotential;
        this.description = wordDefinition?.description || this.text;

        this.ontologicalCategory = wordDefinition.ontologicalCategory || 'Meso';
        this.epistemologicalSchool = wordDefinition.epistemologicalSchool || 'Rationalism';
        this.methodologicalApproach = wordDefinition.methodologicalApproach || 'Analytical';

        this.x = 0;
        this.y = 0;

        this.isDragging = false;
        this.isBeingDestroyed = false;
        this.activationCount = 0;
        this.isVisible = true;

        this.renderer = new WordRenderer(this, this.container, this.engine);
        this.physics = new WordPhysics(this, this.engine);
        this.activation = new WordActivation(this, this.engine);
        this.effects = new WordEffects(this, this.container, this.engine);
        this.interactionHandler = new WordInteractionHandler(this, this.container, this.engine);

        this.init();
    }

    init() {
        this.element = this.renderer.initElement();

        this.addEventListeners();

        this.updateVisibility();
    }

    addEventListeners() {
        if (!this.element) return;

        const handleInteraction = (handlerFn, event) => {
            if (!this.isVisible || this.isBeingDestroyed) return;
            handlerFn.call(this.interactionHandler, event);
        };

        const handleActivation = (event) => {
            if (!this.isVisible || this.isBeingDestroyed) return;
            if (event.target === this.element || event.target.parentNode === this.element) {
                if (!this.interactionHandler.dragMoved) {
                    this.activate();
                }
            }
        }

        this.element.addEventListener('click', handleActivation);

        this.element.addEventListener('mousedown', (e) => {
            if (e.target === this.element || e.target.parentNode === this.element) {
                handleInteraction(this.interactionHandler.startDrag, e);
            }
        });

        this.element.addEventListener('touchstart', (e) => {
            if (e.target === this.element || e.target.parentNode === this.element) {
                e.preventDefault();
                handleInteraction(this.interactionHandler.startDrag, e.touches[0]);
            }
        }, { passive: false });
    }

    update(dt = 1) {
        if (this.isDragging || !this.isVisible || this.isBeingDestroyed) return;

        this.physics.update(dt);
        this.renderer.updatePosition();
        this.updateResonanceVisuals();
    }

    updateVisibility() {
        if (!this.engine || !this.element) return;

        const blindColor = this.engine.gameState.chromaticBlindnessColor;
        const shouldBeVisible = !(blindColor && this.epistemologicalSchool.toLowerCase() === blindColor.toLowerCase());

        if (this.isVisible !== shouldBeVisible) {
            this.isVisible = shouldBeVisible;
            this.renderer.updateVisuals();

            if (!this.isVisible && this.isDragging) {
                this.interactionHandler.endDrag(null, true);
            }
        }
    }

    updateResonanceVisuals() {
        this.renderer.updateVisuals();
    }

    activate() {
        this.activation.activate();
    }

    showCooldownFeedback() {
        this.effects.showCooldownFeedback();
    }

    applyImpulse(impulseX, impulseY) {
        this.physics.applyImpulse(impulseX, impulseY);
    }

    destroy(skipAnimation = false) {
        if (this.isBeingDestroyed) return;

        this.isBeingDestroyed = true;
        this.isVisible = false;

        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            const index = this.engine.gameState.words.indexOf(this);
            if (index > -1) {
                this.engine.gameState.words.splice(index, 1);
            }
        }

        this.renderer.destroyElement(skipAnimation);
        this.element = null;
    }
}