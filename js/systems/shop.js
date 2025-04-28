import { UpgradeSystem } from 'systems/upgrades.js';

export class ShopSystem {
    constructor(engine) {
        this.engine = engine;
        this.shopItemsContainer = document.querySelector('#shop-screen .shop-items');
        this.allPossibleUpgrades = UpgradeSystem.UPGRADE_DEFINITIONS;
        this.currentlyOfferedItems = [];

        if (!this.shopItemsContainer) {
            console.error("Shop items container not found!");
        }
    }

    initShop() {
        // Event listeners for shop open/close are handled by ScreenManager
        // Initial rendering happens when shop is opened
    }

    getCurrentUpgradeLevel(itemId) {
        return this.engine.upgradeSystem?.currentLevels?.[itemId] || 0;
    }

    selectRandomUpgrades(count = 3) {
        const availableUpgrades = this.allPossibleUpgrades.filter(item => {
            const currentLevel = this.getCurrentUpgradeLevel(item.id);
            return currentLevel < item.maxLevel;
        });

        const shuffled = availableUpgrades.sort(() => 0.5 - Math.random());

        this.currentlyOfferedItems = shuffled.slice(0, count).map(item => item.id);
        console.log("Offered upgrades:", this.currentlyOfferedItems);
    }

    renderShopItems() {
        if (!this.shopItemsContainer) return;

        this.selectRandomUpgrades(3);

        this.shopItemsContainer.innerHTML = '';
        const currentEnergy = this.engine.energyManager.getEnergy();

        this.currentlyOfferedItems.forEach(itemId => {
            const item = this.allPossibleUpgrades.find(i => i.id === itemId);
            if (!item) return;

            const currentLevel = this.getCurrentUpgradeLevel(item.id);

            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';

            const costMultiplier = currentLevel > 0 ? (1 + currentLevel * 0.5) : 1;
            const currentCost = Math.round(item.cost * costMultiplier);
            const canAfford = currentEnergy >= currentCost;

            if (!canAfford) {
                itemElement.classList.add('disabled');
            }

            itemElement.innerHTML = `
                <div class="item-name">${item.name} ${currentLevel > 0 ? `(Lvl ${currentLevel + 1})` : ''}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-cost">${currentCost} Energy</div>
                ${currentLevel >= item.maxLevel ? '<div class="max-level">MAX LEVEL</div>' : ''}
            `;

            if (canAfford) {
                itemElement.addEventListener('click', () => this.purchaseUpgrade(item.id));
            } else {
                // Optional: Add tooltip or visual cue for insufficient funds
            }

            this.shopItemsContainer.appendChild(itemElement);
        });

        if (this.currentlyOfferedItems.length === 0 && this.allPossibleUpgrades.every(item => this.getCurrentUpgradeLevel(item.id) >= item.maxLevel)) {
            this.shopItemsContainer.innerHTML = '<p>All upgrades purchased!</p>';
        } else if (this.currentlyOfferedItems.length === 0) {
            this.shopItemsContainer.innerHTML = '<p>No upgrades currently available.</p>';
        }
    }

    purchaseUpgrade(itemId) {
        const item = this.allPossibleUpgrades.find(i => i.id === itemId);
        if (!item) return;

        const currentLevel = this.getCurrentUpgradeLevel(item.id);
        if (currentLevel >= item.maxLevel) {
            console.warn(`Attempted to purchase maxed upgrade: ${itemId}`);
            return;
        }

        const costMultiplier = currentLevel > 0 ? (1 + currentLevel * 0.5) : 1;
        const cost = Math.round(item.cost * costMultiplier);

        if (this.engine.energyManager.getEnergy() >= cost) {
            this.engine.energyManager.addEnergy(-cost);

            this.engine.upgradeSystem.applyUpgrade(item.id);

            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.incrementAchievementProgress('master_upgrader');
            }

            this.renderShopItems();
        } else {
            console.warn(`Insufficient energy to purchase upgrade: ${itemId}`);
            // Optional: Provide visual feedback for insufficient funds
        }
    }
}