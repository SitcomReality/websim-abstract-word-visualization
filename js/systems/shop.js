import { UpgradeSystem } from 'systems/upgrades.js'; 

export class ShopSystem {
    constructor(engine) {
        this.engine = engine;
        this.shopItemsContainer = document.querySelector('#shop-screen .shop-items');
        this.shopItems = UpgradeSystem.UPGRADE_DEFINITIONS; 
        this.currentLevels = {}; 
        this.shopItems.forEach(item => { this.currentLevels[item.id] = 0; });

         if (!this.shopItemsContainer) {
             console.error("Shop items container not found!");
         }
    }

    initShop() {
         // Event listeners for shop open/close are handled by ScreenManager
         // Initial rendering happens when shop is opened
    }

    renderShopItems() {
        if (!this.shopItemsContainer) return;

        this.shopItemsContainer.innerHTML = '';
        const currentEnergy = this.engine.energyManager.getEnergy();

        this.shopItems.forEach(item => {
            const currentLevel = this.currentLevels[item.id];
            const maxLevelReached = currentLevel >= item.maxLevel;

            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';

            // Calculate current cost based on level
            const costMultiplier = currentLevel > 0 ? (1 + currentLevel * 0.5) : 1; 
            const currentCost = Math.round(item.cost * costMultiplier);
            const canAfford = currentEnergy >= currentCost;

             // Disable if max level or cannot afford
             if (maxLevelReached || !canAfford) {
                 itemElement.classList.add('disabled');
             }

            itemElement.innerHTML = `
                <div class="item-name">${item.name} ${currentLevel > 0 ? `(Lvl ${currentLevel})` : ''}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-cost">${maxLevelReached ? '-' : currentCost} Energy</div>
                ${maxLevelReached ? '<div class="max-level">MAX LEVEL</div>' : ''}
            `;

            // Add click listener only if purchasable
            if (!maxLevelReached && canAfford) {
                itemElement.addEventListener('click', () => this.purchaseUpgrade(item.id));
            } else if (!maxLevelReached && !canAfford) {
                // Optional: Add tooltip or visual cue for insufficient funds
            }

            this.shopItemsContainer.appendChild(itemElement);
        });
    }

    purchaseUpgrade(itemId) {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        const currentLevel = this.currentLevels[item.id];
        if (currentLevel >= item.maxLevel) {
             console.warn(`Attempted to purchase maxed upgrade: ${itemId}`);
             return;
        }

        // Recalculate cost for safety
        const costMultiplier = currentLevel > 0 ? (1 + currentLevel * 0.5) : 1;
        const cost = Math.round(item.cost * costMultiplier);

        if (this.engine.energyManager.getEnergy() >= cost) {
            // Deduct energy
            this.engine.energyManager.addEnergy(-cost);

            // Increase item level
            this.currentLevels[item.id]++;

            // Apply upgrade effect via UpgradeSystem
            this.engine.upgradeSystem.applyUpgradeEffect(item, this.currentLevels[item.id]);

            // Re-render shop to reflect changes
            this.renderShopItems();
        } else {
            console.warn(`Insufficient energy to purchase upgrade: ${itemId}`);
            // Optional: Provide visual feedback for insufficient funds
        }
    }
}