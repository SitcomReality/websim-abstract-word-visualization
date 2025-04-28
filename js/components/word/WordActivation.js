import { createSpecialEffect } from 'effects/effectManager.js';

export class WordActivation {
    constructor(core, engine, physics, feedback) {
        this.core = core;
        this.engine = engine;
        this.physics = physics; 
        this.feedback = feedback; 

        this.lastActivationTime = 0;
        this.activationCooldown = 1000; 
        this.activationCount = 0;
    }

    activate() {
        if (this.core.isActive || this.core.isDragging || this.core.isBeingDestroyed || !this.core.isVisible) return;

        const now = Date.now();
        
        if (!this.engine.gameState.eternalismActive && now - this.lastActivationTime < this.activationCooldown) {
            this.feedback.showCooldownFeedback();
            return;
        }

        if (!this.checkCategoricalImperative()) {
            return; 
        }

        if (this.engine.gameState.skepticalMethodActive && Math.random() < 0.3) {
            console.log(`Skeptical Method: Activation failed for ${this.core.id}`);
            this.feedback.showCategoryFeedback("Activation Failed!", false);
            this.lastActivationTime = now; 
            return;
        }

        this.lastActivationTime = now;
        this.activationCount++;
        this.core.isActive = true;

        this.feedback.applyActivationAnimation();

        const centerX = this.core.x + this.core.radius;
        const centerY = this.core.y + this.core.radius;
        createSpecialEffect(this.core.id, centerX, centerY, this.core.colors.primary);

        const resonanceMultiplier = this.engine.resonanceSystem?.wordActivated(this.core) || 1; 
        const comboMultiplier = this.engine.comboSystem?.registerActivation() || 1;
        const multipliers = this.calculateMultipliers(resonanceMultiplier, comboMultiplier);
        const totalMultiplier = multipliers.total;

        if (this.engine && typeof this.engine.addEnergy === 'function') {
            const energyGained = this.core.energyPotential * totalMultiplier;
            this.engine.addEnergy(energyGained);

            if (totalMultiplier > 1) this.feedback.showMultiplierEffect(totalMultiplier);
            this.feedback.createFloatingRewardParticles(centerX, centerY, Math.ceil(energyGained));

            this.engine.achievementSystem?.incrementAchievementProgress('word_activator');
        } else {
            console.warn(`Word ${this.core.id}: Engine or addEnergy function not available.`);
        }

        setTimeout(() => {
            this.core.isActive = false;
        }, 300); 
    }

    calculateMultipliers(resonanceMultiplier, comboMultiplier) {
        const skepticalBonus = this.engine.gameState.skepticalMethodActive ? 3 : 1; 
        const chromaticBonus = (this.engine.gameState.chromaticBlindnessColor &&
                                this.core.epistemologicalSchool.toLowerCase() !== this.engine.gameState.chromaticBlindnessColor.toLowerCase())
                                ? 4 : 1;
        const eternalismModifier = this.engine.gameState.eternalismActive ? 0.6 : 1;

        const categoricalBonus = (this.engine.gameState.categoricalImperativeActive &&
                                  this.engine.gameState.categoricalSequence.justCompleted)
                                 ? 3 : 1;
        if (this.engine.gameState.categoricalImperativeActive) {
            this.engine.gameState.categoricalSequence.justCompleted = false; 
        }

        const total = resonanceMultiplier * comboMultiplier * skepticalBonus *
                      chromaticBonus * eternalismModifier * categoricalBonus;

        return {
            resonance: resonanceMultiplier,
            combo: comboMultiplier,
            skeptical: skepticalBonus,
            chromatic: chromaticBonus,
            eternalism: eternalismModifier,
            categorical: categoricalBonus,
            total: total
        };
    }

    checkCategoricalImperative() {
        if (!this.engine.gameState.categoricalImperativeActive) {
            return true; 
        }

        const sequence = this.engine.gameState.categoricalSequence;
        const currentCategory = this.core.ontologicalCategory; 

        if (!sequence) {
            console.error("Categorical Imperative active but sequence state missing.");
            return false;
        }
        sequence.justCompleted = false; 

        const requiredCategoryIndex = sequence.stepsComplete; 

        if (requiredCategoryIndex < 0 || requiredCategoryIndex >= sequence.categories.length) {
            sequence.stepsComplete = 0;
            if (currentCategory !== sequence.categories[0]) {
                this.feedback.showCategoryFeedback(`Sequence Reset! Must start with ${sequence.categories[0]}.`, false);
                return false;
            }
            sequence.stepsComplete = 1; 
            return true;
        }

        const expectedCategory = sequence.categories[requiredCategoryIndex];
        if (currentCategory !== expectedCategory) {
            this.feedback.showCategoryFeedback(`Sequence Broken! Expected ${expectedCategory}.`, false);
            sequence.stepsComplete = 0; 
            return false;
        }

        sequence.stepsComplete += 1;

        if (sequence.stepsComplete === sequence.categories.length) {
            this.feedback.showCategoryFeedback('Sequence Complete! +Energy Bonus!', true);
            sequence.justCompleted = true; 
            sequence.stepsComplete = 0; 
        } else {
            this.feedback.showCategoryFeedback(`${currentCategory} → ${sequence.categories[sequence.stepsComplete]}?`, true); 
        }

        return true;
    }
}