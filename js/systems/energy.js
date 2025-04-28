import { createSpecialEffect } from 'effects/effectManager.js'; // Assume an effect for energy gain

export class EnergyManager {
    constructor(engine, initialEnergy = 0, displayElement = null) {
        this.engine = engine;
        this.currentEnergy = initialEnergy;
        this.energyDisplayElement = displayElement;
        this._energyRushTracking = null; // Initialize tracking variable
    }

    setDisplayElement(element) {
        this.energyDisplayElement = element;
        if (!this.energyDisplayElement) {
            console.warn("Energy display element not provided or found.");
        }
    }

    addEnergy(amount) {
        if (isNaN(amount)) {
            console.error("Invalid amount passed to addEnergy:", amount);
            return;
        }

        // Track energy gained for achievements
        if (amount > 0) {
            this.trackEnergyRush(amount);
            // Optional: Show a simple visual effect where energy was gained
            // This requires coordinates, which aren't directly available here.
            // Consider triggering this effect from the source (Word activation, fusion, etc.)
        }

        this.currentEnergy += amount;
        this.currentEnergy = Math.max(0, this.currentEnergy);
        this.updateEnergyDisplay();
        this.showEnergyChangeEffect(amount); // Visual feedback on the counter

        // Check if the shop screen is active and update it if energy changes
        if (this.engine.gameState.currentScreen === 'shop') {
            // Check if shopSystem exists and has the renderShopItems method
            if (this.engine.shopSystem && typeof this.engine.shopSystem.renderShopItems === 'function') {
                this.engine.shopSystem.renderShopItems(); // Call the method on shopSystem
            } else {
                console.warn("ShopSystem or renderShopItems method not found while trying to update shop.");
            }
        }
    }

    getEnergy() {
        return this.currentEnergy;
    }

    updateEnergyDisplay() {
        if (this.energyDisplayElement) {
            this.energyDisplayElement.textContent = `Energy: ${Math.floor(this.currentEnergy)}`;
        }
    }

    showEnergyChangeEffect(amount) {
        if (!this.energyDisplayElement) return;

        const energyCounter = this.energyDisplayElement;
        energyCounter.classList.remove('energy-increase', 'energy-decrease');
        void energyCounter.offsetWidth; // Force reflow

        if (amount > 0) {
            energyCounter.classList.add('energy-increase');
            energyCounter.dataset.amount = `+${Math.floor(amount)}`;
        } else if (amount < 0) {
            energyCounter.classList.add('energy-decrease');
            energyCounter.dataset.amount = `${Math.floor(amount)}`;
        }

        // Clear the classes and data attribute after the animation
        setTimeout(() => {
             if (energyCounter) {
                 energyCounter.classList.remove('energy-increase', 'energy-decrease');
                 delete energyCounter.dataset.amount;
             }
         }, 600); // Match animation duration if possible
    }

    trackEnergyRush(amount) {
        // Track rapid energy gains for the Energy Rush achievement
        if (!this.engine.achievementSystem) return;

        if (!this._energyRushTracking) {
            this._energyRushTracking = {
                startTime: Date.now(),
                totalGained: 0
            };
        }

        const now = Date.now();
        // Reset tracking if more than 10 seconds have passed
        if (now - this._energyRushTracking.startTime > 10000) {
            this._energyRushTracking.startTime = now;
            this._energyRushTracking.totalGained = 0;
        }

        this._energyRushTracking.totalGained += amount;

        // Check if we've gained enough energy in the time window
        const achievement = this.engine.achievementSystem.getAchievementById('energy_boost');
        if (achievement && !achievement.achieved) {
            // Update progress directly (assuming progress property exists)
            achievement.progress = Math.min(this._energyRushTracking.totalGained, achievement.progressGoal);
            this.engine.achievementSystem.renderAchievementList(); // Update UI
            if (achievement.condition()) { // Re-check condition after update
                this.engine.achievementSystem.unlockAchievement('energy_boost');
                 // Reset tracking after achieving to prevent immediate re-triggering
                 this._energyRushTracking = null;
            }
        }
    }
}