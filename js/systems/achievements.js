export class AchievementSystem {
    constructor(engine) {
        this.engine = engine;
        this.achievements = [
            {
                id: 'first_fusion',
                name: 'Lexical Alchemist',
                description: 'Successfully fuse two words together',
                achieved: false,
                energyReward: 100,
                condition: () => true, // Will be triggered manually on first fusion success
                icon: '🧪'
            },
            {
                id: 'energy_collector',
                name: 'Energy Hoarder',
                description: 'Accumulate 500 energy',
                achieved: false,
                energyReward: 50,
                condition: () => this.engine.currentEnergy >= 500,
                icon: '💰'
            },
            {
                id: 'word_activator',
                name: 'Wordsmith',
                description: 'Activate words 50 times',
                achieved: false,
                energyReward: 75,
                progress: 0,
                progressGoal: 50,
                condition: () => this.getAchievementById('word_activator').progress >= 50,
                icon: '🔮'
            },
            {
                id: 'master_upgrader',
                name: 'Upgrade Master',
                description: 'Purchase 10 upgrades',
                achieved: false,
                energyReward: 120,
                progress: 0,
                progressGoal: 10,
                condition: () => this.getAchievementById('master_upgrader').progress >= 10,
                icon: '⚙️'
            },
            {
                id: 'combo_novice',
                name: 'Combo Novice',
                description: 'Reach a 5x combo streak',
                achieved: false,
                energyReward: 75,
                condition: () => false, // Triggered by combo system
                icon: '🔄'
            },
            {
                id: 'combo_master',
                name: 'Combo Master',
                description: 'Reach a 10x combo streak',
                achieved: false,
                energyReward: 150,
                condition: () => false, // Triggered by combo system
                icon: '⚡'
            },
            {
                id: 'energy_boost',
                name: 'Energy Rush',
                description: 'Gain 100+ energy in under 10 seconds',
                achieved: false,
                energyReward: 100,
                progress: 0,
                progressGoal: 100,
                condition: () => this.getAchievementById('energy_boost').progress >= 100,
                icon: '🚀'
            }
        ];
        
        this.achievementNotificationsContainer = null;
        this.initAchievementDisplay();
    }
    
    initAchievementDisplay() {
        // Create container for achievement notifications
        this.achievementNotificationsContainer = document.createElement('div');
        this.achievementNotificationsContainer.id = 'achievement-notifications';
        document.body.appendChild(this.achievementNotificationsContainer);
        
        // Create achievement panel
        this.achievementPanel = document.createElement('div');
        this.achievementPanel.id = 'achievement-panel';
        this.achievementPanel.innerHTML = `
            <div class="achievement-header">
                <h3>Achievements</h3>
                <span class="close-achievements">×</span>
            </div>
            <div class="achievement-list"></div>
        `;
        document.body.appendChild(this.achievementPanel);
        
        // Create achievement button
        this.achievementButton = document.createElement('div');
        this.achievementButton.id = 'achievement-button';
        this.achievementButton.innerHTML = '🏆';
        document.body.appendChild(this.achievementButton);
        
        // Add event listeners
        this.achievementButton.addEventListener('click', () => this.toggleAchievementPanel());
        this.achievementPanel.querySelector('.close-achievements').addEventListener('click', () => this.toggleAchievementPanel(false));
        
        // Render achievements
        this.renderAchievementList();
    }
    
    toggleAchievementPanel(show) {
        const panel = this.achievementPanel;
        if (show === undefined) {
            panel.classList.toggle('visible');
        } else {
            panel.classList.toggle('visible', show);
        }
    }
    
    renderAchievementList() {
        const list = this.achievementPanel.querySelector('.achievement-list');
        list.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement-item ${achievement.achieved ? 'achieved' : 'locked'}`;
            
            let progressHtml = '';
            if (achievement.progressGoal) {
                const percent = Math.min(100, Math.floor((achievement.progress / achievement.progressGoal) * 100));
                progressHtml = `
                    <div class="achievement-progress">
                        <div class="progress-bar" style="width: ${percent}%"></div>
                        <span class="progress-text">${achievement.progress}/${achievement.progressGoal}</span>
                    </div>
                `;
            }
            
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-content">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${progressHtml}
                </div>
                <div class="achievement-reward">+${achievement.energyReward}</div>
            `;
            
            list.appendChild(achievementEl);
        });
    }
    
    getAchievementById(id) {
        return this.achievements.find(a => a.id === id) || null;
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.achieved && achievement.condition()) {
                this.unlockAchievement(achievement.id);
            }
        });
    }
    
    unlockAchievement(id) {
        const achievement = this.getAchievementById(id);
        if (!achievement || achievement.achieved) return;
        
        achievement.achieved = true;
        this.engine.addEnergy(achievement.energyReward);
        this.showAchievementNotification(achievement);
        this.renderAchievementList();
        
        console.log(`Achievement unlocked: ${achievement.name}`);
    }
    
    incrementAchievementProgress(id, amount = 1) {
        const achievement = this.getAchievementById(id);
        if (!achievement || achievement.achieved) return;
        
        if (achievement.progress !== undefined) {
            achievement.progress += amount;
            this.renderAchievementList();
            
            if (achievement.condition()) {
                this.unlockAchievement(id);
            }
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-content">
                <div class="notification-title">Achievement Unlocked!</div>
                <div class="notification-name">${achievement.name}</div>
                <div class="notification-reward">+${achievement.energyReward} energy</div>
            </div>
        `;
        
        this.achievementNotificationsContainer.appendChild(notification);
        
        // Animate entry
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                if (this.achievementNotificationsContainer.contains(notification)) {
                    this.achievementNotificationsContainer.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
}