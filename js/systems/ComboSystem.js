export class ComboSystem {
    constructor(engine) {
        this.engine = engine;
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastActivationTime = 0;
        this.comboTimeWindow = 3000; // 3 seconds to maintain combo
        this.comboDisplayElement = null;
        this.comboTimer = null;
        
        this.createComboDisplay();
    }
    
    createComboDisplay() {
        this.comboDisplayElement = document.createElement('div');
        this.comboDisplayElement.className = 'combo-counter';
        document.body.appendChild(this.comboDisplayElement);
    }
    
    registerActivation() {
        const now = Date.now();
        
        // Check if we're within the combo window
        if (now - this.lastActivationTime < this.comboTimeWindow) {
            this.comboCount++;
            if (this.comboCount > this.maxCombo) {
                this.maxCombo = this.comboCount;
                // Possible achievement for reaching combo milestones
                this.checkComboAchievements();
            }
        } else {
            this.comboCount = 1; // Reset combo
        }
        
        this.lastActivationTime = now;
        this.updateComboDisplay();
        
        // Clear existing timer and set a new one
        if (this.comboTimer) clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => this.resetCombo(), this.comboTimeWindow);
        
        // Return combo multiplier (starts at 1.0, increases with combo)
        return this.getComboMultiplier();
    }
    
    getComboMultiplier() {
        // Square root scaling for multiplier: 1x at combo 1, 2x at combo 4, 3x at combo 9, etc.
        return Math.min(1 + Math.sqrt(this.comboCount - 1) * 0.5, 5); // Cap at 5x
    }
    
    updateComboDisplay() {
        if (!this.comboDisplayElement) return;
        
        if (this.comboCount <= 1) {
            this.comboDisplayElement.classList.remove('active');
            return;
        }
        
        const multiplier = this.getComboMultiplier().toFixed(1);
        this.comboDisplayElement.textContent = `Combo: ${this.comboCount}x (${multiplier}×)`;
        this.comboDisplayElement.classList.add('active');
        
        // Special effects for milestone combos
        if (this.comboCount % 5 === 0 || this.comboCount >= 10) {
            this.comboDisplayElement.classList.add('highlight', 'rainbow-glow');
            setTimeout(() => {
                if (this.comboDisplayElement) {
                    this.comboDisplayElement.classList.remove('highlight', 'rainbow-glow');
                }
            }, 1000);
        }
    }
    
    resetCombo() {
        if (this.comboCount > 1) {
            // Give a final energy reward based on max combo reached
            const comboBonus = Math.ceil(this.comboCount * 2);
            this.engine.addEnergy(comboBonus);
            this.showComboBonusMessage(comboBonus);
        }
        
        this.comboCount = 0;
        if (this.comboDisplayElement) {
            this.comboDisplayElement.classList.remove('active');
        }
    }
    
    showComboBonusMessage(amount) {
        const message = document.createElement('div');
        message.className = 'combo-bonus-message';
        message.textContent = `Combo Bonus: +${amount} Energy!`;
        message.style.position = 'fixed';
        message.style.left = '50%';
        message.style.top = '80px';
        message.style.transform = 'translateX(-50%)';
        message.style.color = '#ffeb3b';
        message.style.fontWeight = 'bold';
        message.style.fontSize = '1.3em';
        message.style.textShadow = '0 0 10px rgba(255, 235, 59, 0.7)';
        message.style.zIndex = '200';
        document.body.appendChild(message);
        
        message.animate([
            { opacity: 0, transform: 'translateX(-50%) scale(0.8)' },
            { opacity: 1, transform: 'translateX(-50%) scale(1.1)' },
            { opacity: 1, transform: 'translateX(-50%) scale(1)' },
            { opacity: 0, transform: 'translateX(-50%) scale(1.2)' }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        };
    }
    
    checkComboAchievements() {
        if (!this.engine.achievementSystem) return;
        
        if (this.comboCount >= 5 && !this.engine.achievementSystem.getAchievementById('combo_novice')?.achieved) {
            this.engine.achievementSystem.unlockAchievement('combo_novice');
        }
        
        if (this.comboCount >= 10 && !this.engine.achievementSystem.getAchievementById('combo_master')?.achieved) {
            this.engine.achievementSystem.unlockAchievement('combo_master');
        }
    }
}