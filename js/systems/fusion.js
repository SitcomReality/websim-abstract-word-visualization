import { createSpecialEffect } from 'effects/effectManager.js';
import { Word } from 'components/Word.js'; // Import Word if needed, maybe not if using wordManager

export class FusionSystem {
    constructor(engine) {
        this.engine = engine;
    }

    attemptFusion(word1, word2) {
        if (!this.engine || word1.isBeingDestroyed || word2.isBeingDestroyed) return; // Don't fuse destroyed words

        // --- Fusion Parameters ---
        const baseAffinity = 0.4; // Base chance of success
        const affinityRoll = Math.random() * (this.engine.fusionSuccessRateModifier || 1); // Roll based on upgrades
        const energyCost = 15; // Energy required to attempt fusion
        const fusionThreshold = 1 - baseAffinity; // Required roll value for success

        console.log(`Attempting fusion: ${word1.id} + ${word2.id}. Roll ${affinityRoll.toFixed(2)} vs Threshold ${fusionThreshold.toFixed(2)}, Cost ${energyCost}, Energy ${this.engine.currentEnergy}`);

        if (affinityRoll > fusionThreshold && this.engine.currentEnergy >= energyCost) {
            // --- Successful Fusion ---
            this.engine.addEnergy(-energyCost); // Deduct energy cost

            // Unlock first fusion achievement
            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.unlockAchievement('first_fusion');
            }

            // Calculate fusion point (midpoint between centers)
            const fusionX = (word1.x + word1.radius + word2.x + word2.radius) / 2;
            const fusionY = (word1.y + word1.radius + word2.y + word2.radius) / 2;

            // Create visual effect for fusion
            const fusionColor = this.blendColors(word1.colors.primary, word2.colors.primary);
            createSpecialEffect('fusion', fusionX, fusionY, fusionColor, 30);

            // Display fusion text message
            this.showFusionMessage(word1.text, word2.text, fusionX, fusionY);

            // --- Fusion Outcome ---
            const createNewWordChance = 0.6; // Chance to create a new word vs. just getting energy
            if (Math.random() < createNewWordChance) {
                console.log("Fusion successful: Creating new word.");
                this.createFusionWord(word1, word2, fusionX, fusionY, fusionColor);
                // Destroy original words AFTER potentially creating the new one
                word1.destroy();
                word2.destroy();
            } else {
                console.log("Fusion successful: Granting bonus energy.");
                this.engine.addEnergy(35); // Increased bonus energy
                // Push words apart gently after successful energy bonus
                const pushForce = 3; // Reduced push force compared to failure
                const angle = Math.atan2(word1.y - word2.y, word1.x - word2.x);
                word1.applyImpulse(Math.cos(angle) * pushForce, Math.sin(angle) * pushForce);
                word2.applyImpulse(-Math.cos(angle) * pushForce, -Math.sin(angle) * pushForce);
            }
        } else {
            console.log("Fusion failed (low affinity or insufficient energy).");
            const pushForce = 5;
            const angle = Math.atan2(word1.y - word2.y, word1.x - word2.x);
            word1.applyImpulse(Math.cos(angle) * pushForce, Math.sin(angle) * pushForce);
            word2.applyImpulse(-Math.cos(angle) * pushForce, -Math.sin(angle) * pushForce);
        }
    }

    createFusionWord(word1, word2, x, y, color) {
        if (!this.engine || !this.engine.wordManager) return;

        const fusionText = this.generateFusionName(word1.text, word2.text);
        const fusionSize = Math.max(60, Math.min(200, (word1.size + word2.size) / 2 * (0.9 + Math.random() * 0.2))); // Adjusted size calculation
        const energyBonus = Math.ceil((word1.energyPotential + word2.energyPotential) * 0.75); // Energy bonus from fusion

        const fusionData = {
            id: `fusion_${word1.id}_${word2.id}_${Date.now()}`.slice(0, 50), // ID generation
            text: fusionText,
            size: fusionSize,
            colors: {
                primary: color,
                secondary: this.blendColors(word1.colors.secondary, word2.colors.secondary)
            },
            energyPotential: energyBonus // Energy potential of the new word
        };

        const fusionWord = this.engine.wordManager.createAndAddWord(fusionData, this.engine.container);

        if (fusionWord) {
            fusionWord.x = x - fusionWord.radius;
            fusionWord.y = y - fusionWord.radius;
            fusionWord.vx = (Math.random() - 0.5) * 2;
            fusionWord.vy = (Math.random() - 0.5) * 2;
            fusionWord.updateElementPosition();

            this.engine.addEnergy(50); // Bonus energy for successful fusion
            console.log(`Created fusion word: ${fusionWord.id} (${fusionWord.text})`);
        } else {
            console.error("Failed to create fusion word instance.");
        }
    }

    generateFusionName(word1, word2) {
        const parts1 = word1.split(' ');
        const parts2 = word2.split(' ');
        const w1 = parts1[0]; // Primary part of the first word
        const w2 = parts2[0]; // Primary part of the second word

        const methods = [
            () => `${w1.substring(0, Math.ceil(w1.length / 2))}${w2.substring(Math.floor(w2.length / 2))}`, // Combine first half of w1 with second half of w2
            () => `${w2.substring(0, Math.ceil(w2.length / 2))}${w1.substring(Math.floor(w1.length / 2))}`, // Combine first half of w2 with second half of w1
            () => `${w1.slice(0, 3)}${w2.slice(-3)}`, // Combine first 3 letters of w1 with last 3 letters of w2
            () => `${w1}-${w2}`.substring(0,15), // Hyphenate w1 and w2, limited to 15 characters
        ];

        const chosenMethod = methods[Math.floor(Math.random() * methods.length)];
        let fusedName = chosenMethod();

        fusedName = fusedName.charAt(0).toUpperCase() + fusedName.slice(1);

        if (parts1.length > 1 && parts2.length > 1 && Math.random() > 0.5) {
            const descriptor = Math.random() > 0.5 ? parts1[1] : parts2[1];
            fusedName += ` ${descriptor}`;
        } else if (parts1.length > 1 && Math.random() > 0.3) {
            fusedName += ` ${parts1[1]}`;
        } else if (parts2.length > 1 && Math.random() > 0.3) {
            fusedName += ` ${parts2[1]}`;
        }

        return fusedName.substring(0, 25); // Limit the fused name to 25 characters
    }

    blendColors(color1, color2) {
        try {
            const parseColor = (hexColor) => {
                if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
                    return { r: 128, g: 128, b: 128 }; // Default to medium gray if invalid color
                }
                const hex = hexColor.slice(1);
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                if (isNaN(r) || isNaN(g) || isNaN(b)) {
                    return { r: 128, g: 128, b: 128 };
                }
                return { r, g, b };
            };

            const c1 = parseColor(color1);
            const c2 = parseColor(color2);

            const blend = {
                r: Math.floor((c1.r + c2.r) / 2),
                g: Math.floor((c1.g + c2.g) / 2),
                b: Math.floor((c1.b + c2.b) / 2)
            };

            const toHex = (c) => c.toString(16).padStart(2, '0');
            return `#${toHex(blend.r)}${toHex(blend.g)}${toHex(blend.b)}`;

        } catch (error) {
            console.error("Error blending colors:", color1, color2, error);
            return '#ffffff'; // Default to white if blending fails
        }
    }

    showFusionMessage(word1, word2, x, y) {
        const message = document.createElement('div');
        message.innerText = `${word1.split(' ')[0]} + ${word2.split(' ')[0]}`; // Display the primary parts of the words

        message.style.position = 'absolute';
        message.style.left = `${x}px`;
        message.style.top = `${y}px`;
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#ffffff';
        message.style.fontWeight = 'bold';
        message.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        message.style.pointerEvents = 'none';
        message.style.zIndex = '200';
        this.engine.container.appendChild(message);

        message.animate([
            { opacity: 1, transform: 'translate(-50%, -50%)' },
            { opacity: 0, transform: 'translate(-50%, -120%)' }
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.engine.container.contains(message)) {
                this.engine.container.removeChild(message);
            }
        };
    }
}