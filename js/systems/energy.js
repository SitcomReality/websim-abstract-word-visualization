export class EnergyManager {
    constructor(engine, initialEnergy = 0, displayElement = null) {
        this.engine = engine; 
        this.currentEnergy = initialEnergy;
        this.energyDisplayElement = displayElement;
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
        }
        
        this.currentEnergy += amount;
        this.currentEnergy = Math.max(0, this.currentEnergy); 
        this.updateEnergyDisplay();
        this.showEnergyChangeEffect(amount);

        if(this.engine.gameState.currentScreen === 'shop'){
            this.engine.renderShopItems();
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
        void energyCounter.offsetWidth; 

        if (amount > 0) {
            energyCounter.classList.add('energy-increase');
            energyCounter.dataset.amount = `+${Math.floor(amount)}`;
        } else if (amount < 0) {
            energyCounter.classList.add('energy-decrease');
            energyCounter.dataset.amount = `${Math.floor(amount)}`; 
        }

        setTimeout(() => {
             if (energyCounter) { 
                 energyCounter.classList.remove('energy-increase', 'energy-decrease');
                 delete energyCounter.dataset.amount; 
             }
         }, 600);
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
            achievement.progress = this._energyRushTracking.totalGained;
            this.engine.achievementSystem.renderAchievementList();
            if (achievement.condition()) {
                this.engine.achievementSystem.unlockAchievement('energy_boost');
            }
        }
    }
}