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

        // --- Check GDD Activation Constraints ---
        if (this.engine.gameState.holistVisionActive && this.core.ontologicalCategory === 'Micro') {
            this.feedback.showCategoryFeedback("Cannot activate Micro directly (Holist Vision)", false);
            return;
        }
        if (this.engine.gameState.reductionistToolkitActive && this.core.ontologicalCategory === 'Macro') {
            this.feedback.showCategoryFeedback("Cannot activate Macro directly (Reductionist Toolkit)", false);
            return;
        }
        // --- End GDD Constraints ---

        if (!this.checkCategoricalImperative()) {
            return;
        }

        if (this.engine.gameState.skepticalMethodActive && Math.random() < 0.3) {
            console.log(`Skeptical Method: Activation failed for ${this.core.id}`);
            this.feedback.showCategoryFeedback("Activation Failed!", false);
            this.lastActivationTime = now;
            // Apply cooldown even on failure for Skeptical Method
            if (!this.engine.gameState.eternalismActive) {
                 this.lastActivationTime = now;
            }
            return;
        }

        if (!this.engine.gameState.eternalismActive) {
            this.lastActivationTime = now;
        }
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

            // Tutorial progression
            if (this.engine.gameState.tutorialStep === 0) {
                this.engine.gameState.tutorialStep = 1;
                 setTimeout(() => this.engine.showTutorialHint("Good! Now try dragging compatible words together to fuse them."), 1000);
            }

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
                                ? 4 : 1; // Now 4x as per GDD
        const eternalismModifier = this.engine.gameState.eternalismActive ? 0.6 : 1;

        const categoricalBonus = (this.engine.gameState.categoricalImperativeActive &&
                                  this.engine.gameState.categoricalSequence?.justCompleted) // Check if sequence exists
                                 ? 3 : 1;
        if (this.engine.gameState.categoricalImperativeActive && this.engine.gameState.categoricalSequence) {
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

        // If sequence is complete or just started (index 0)
        if (requiredCategoryIndex === 0) {
            if (currentCategory !== sequence.categories[0]) {
                this.feedback.showCategoryFeedback(`Sequence Reset! Must start with ${sequence.categories[0]}.`, false);
                sequence.stepsComplete = 0; // Stay at 0
                return false;
            }
            // Correctly started the sequence
            sequence.stepsComplete = 1;
            this.feedback.showCategoryFeedback(`${currentCategory} → ${sequence.categories[sequence.stepsComplete]}?`, true);
            return true;
        }

        // If sequence is in progress (index > 0)
        if (requiredCategoryIndex < sequence.categories.length) {
            const expectedCategory = sequence.categories[requiredCategoryIndex];
            if (currentCategory !== expectedCategory) {
                this.feedback.showCategoryFeedback(`Sequence Broken! Expected ${expectedCategory}. Resetting.`, false);
                sequence.stepsComplete = 0; // Reset sequence
                // Check if the current word could start a NEW sequence
                if (currentCategory === sequence.categories[0]) {
                    sequence.stepsComplete = 1;
                     this.feedback.showCategoryFeedback(`${currentCategory} → ${sequence.categories[sequence.stepsComplete]}?`, true);
                    return true; // Allow activation, starting new sequence
                }
                return false; // Don't allow activation if sequence is broken and current word doesn't start a new one
            }

            // Correctly continued the sequence
            sequence.stepsComplete += 1;

            if (sequence.stepsComplete === sequence.categories.length) {
                this.feedback.showCategoryFeedback('Sequence Complete! +Energy Bonus!', true);
                sequence.justCompleted = true; // Flag for bonus calculation
                sequence.stepsComplete = 0; // Reset for next sequence
            } else {
                this.feedback.showCategoryFeedback(`${currentCategory} → ${sequence.categories[sequence.stepsComplete]}?`, true);
            }
            return true;
        }

        // Should not reach here if logic is correct, but reset just in case
        console.warn("Categorical Imperative reached unexpected state. Resetting.");
        sequence.stepsComplete = 0;
        return false;
    }
}