import { createSpecialEffect } from 'effects/effectManager.js'; // Assume an effect for energy gain

export class ResonanceSystem {
    constructor(engine) {
        this.engine = engine;
        this.activeChains = [];
        this.chainTypes = {
            ETYMOLOGICAL: { name: 'Etymological', multiplier: 1.5, color: '#9c27b0' },
            SEMANTIC: { name: 'Semantic', multiplier: 1.8, color: '#2196f3' },
            PHONETIC: { name: 'Phonetic', multiplier: 1.3, color: '#ff9800' },
            CHROMATIC: { name: 'Chromatic', multiplier: 2.0, color: '#4caf50' }
        };
        this.wordAffinities = {
            logos_aether: 'ETYMOLOGICAL',
            logos_quintessence: 'ETYMOLOGICAL',
            kairos_monad: 'ETYMOLOGICAL',
            aether_quintessence: 'ETYMOLOGICAL',
            apeiron_entropy: 'SEMANTIC',
            aether_anima: 'SEMANTIC',
            monad_logos: 'SEMANTIC',
            anima_kairos: 'SEMANTIC',
            kairos_logos: 'PHONETIC',
            aether_apeiron: 'PHONETIC',
            entropy_quintessence: 'CHROMATIC',
            apeiron_monad: 'CHROMATIC',
            logos_aether: 'CHROMATIC'
        };

        this.lastActivatedWord = null;
        this.activationTimeout = null;
        this.baseChainDecayTime = 6000;
        this.chainDecayTime = this.baseChainDecayTime;

        this.resonanceDisplay = null;
        this.initResonanceDisplay();
    }

    initResonanceDisplay() {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen) {
             console.warn("Game screen not found, cannot initialize resonance display.");
             return;
        }
        this.resonanceDisplay = document.createElement('div');
        this.resonanceDisplay.id = 'resonance-display';
        gameScreen.appendChild(this.resonanceDisplay);
        this.resonanceDisplay.style.display = 'none';
    }

    wordActivated(word) {
        if (!this.lastActivatedWord || word === this.lastActivatedWord) {
            this.lastActivatedWord = word;
            this.startChainTimer();
            this.clearVisuals();
            return 1;
        }

        const chainKey1 = `${this.lastActivatedWord.id}_${word.id}`;
        const chainKey2 = `${word.id}_${this.lastActivatedWord.id}`;
        const chainTypeKey = this.wordAffinities[chainKey1] || this.wordAffinities[chainKey2];

        let currentMultiplier = 1;

        if (chainTypeKey) {
            clearTimeout(this.activationTimeout);
            this.startChainTimer();

            const chainType = this.chainTypes[chainTypeKey];

            let chain = this.activeChains.find(c => c.type === chainTypeKey);
            if (!chain) {
                chain = {
                    type: chainTypeKey,
                    words: [this.lastActivatedWord],
                    multiplier: chainType.multiplier,
                    startTime: Date.now()
                };
                this.activeChains.push(chain);
                this.showChainStartEffect(chain);
            } else {
                 chain.startTime = Date.now(); // Reset timer on existing chain
            }

            // Add the new word if it's not the same as the last one added to this chain
            if (!chain.words.includes(word)) {
                chain.words.push(word);
                // Increase multiplier, but maybe cap it or have diminishing returns?
                chain.multiplier = parseFloat((chain.multiplier + 0.2).toFixed(1));
                // Create visual connection only when adding a NEW word to the chain
                this.showConnectionEffect(this.lastActivatedWord, word, chainType.color);
            }

            this.lastActivatedWord = word;
            this.updateResonanceDisplay();

            currentMultiplier = chain.multiplier;
        } else {
             // Chain broken or different type attempted
            this.lastActivatedWord = word;
            this.activeChains = []; // Clear all active chains if the sequence is broken
            this.clearChainTimer();
            this.startChainTimer(); // Start timer for the new single word
            this.updateResonanceDisplay();
            currentMultiplier = 1;
        }

        this.updateAllWordVisuals();

        return currentMultiplier;
    }

    canFormResonance(word) {
        if (!this.lastActivatedWord || word === this.lastActivatedWord) return false;

        const chainKey1 = `${this.lastActivatedWord.id}_${word.id}`;
        const chainKey2 = `${word.id}_${this.lastActivatedWord.id}`;
        return !!(this.wordAffinities[chainKey1] || this.wordAffinities[chainKey2]);
    }

    clearChainTimer() {
        if (this.activationTimeout) {
            clearTimeout(this.activationTimeout);
            this.activationTimeout = null;
        }
    }

    startChainTimer() {
        this.clearChainTimer();
        this.activationTimeout = setTimeout(() => {
            console.log("Resonance chain decayed.");
            this.lastActivatedWord = null;
            this.activeChains = [];
            this.updateResonanceDisplay();
            this.clearVisuals();
            this.updateAllWordVisuals(); // Ensure resonance indicators are cleared
        }, this.chainDecayTime);
    }

    clearVisuals() {
        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            this.engine.gameState.words.forEach(w => {
                if (w.element) {
                    w.element.classList.remove('resonance-ready');
                }
            });
        }
    }

    updateAllWordVisuals() {
        if (this.engine && this.engine.gameState && this.engine.gameState.words) {
            this.engine.gameState.words.forEach(w => w.updateResonanceVisuals());
        }
    }

    showChainStartEffect(chain) {
        const displayArea = this.resonanceDisplay || document.body;
        const rect = displayArea.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 30;

        const particles = 15;
        const color = this.chainTypes[chain.type].color;

        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'resonance-particle';

            const size = 5 + Math.random() * 8;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = color;
            particle.style.borderRadius = '50%';
            particle.style.position = 'fixed';
            particle.style.left = `${x + (Math.random() - 0.5) * 40}px`;
            particle.style.top = `${y + (Math.random() - 0.5) * 20}px`;
            particle.style.opacity = '0.8';
            particle.style.zIndex = '110';
            particle.style.pointerEvents = 'none';

            document.body.appendChild(particle);

            const angle = (Math.random() - 0.5) * Math.PI;
            const distance = 50 + Math.random() * 100;

            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
                {
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0.5)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (document.body.contains(particle)) {
                    document.body.removeChild(particle);
                }
            };
        }
    }

    showConnectionEffect(word1, word2, color) {
        const container = this.engine.container;
        if (!container || !word1 || !word2 || !word1.element || !word2.element) return;

        const x1 = word1.x + word1.radius;
        const y1 = word1.y + word1.radius;
        const x2 = word2.x + word2.radius;
        const y2 = word2.y + word2.radius;

        const connection = document.createElement('div');
        connection.className = 'resonance-connection';

        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

        connection.style.position = 'absolute';
        connection.style.width = `${length}px`;
        connection.style.height = '3px';
        connection.style.background = `linear-gradient(to right, ${color}66, ${color}ff, ${color}66)`;
        connection.style.left = `${x1}px`;
        connection.style.top = `${y1}px`;
        connection.style.transformOrigin = '0 50%';
        connection.style.transform = `rotate(${angle}deg)`;
        connection.style.opacity = '0.7';
        connection.style.zIndex = '95';
        connection.style.pointerEvents = 'none';
        connection.style.borderRadius = '2px';
        container.appendChild(connection);

        // Animate the connection line to fade out and disappear
        connection.animate([
            { opacity: 0.7, transform: `rotate(${angle}deg) scaleY(1)` },
            { opacity: 0, transform: `rotate(${angle}deg) scaleY(0)` } // Fade out by scaling Y to 0
        ], {
            duration: 800, // Duration of the fade effect
            easing: 'ease-out' // Smooth fading
        }).onfinish = () => {
            // Remove the element from the DOM after the animation completes
            if (container.contains(connection)) {
                container.removeChild(connection);
            }
        };
    }

    updateResonanceDisplay() {
        if (!this.resonanceDisplay) return;

        if (this.activeChains.length === 0) {
            this.resonanceDisplay.innerHTML = '';
            this.resonanceDisplay.style.display = 'none';
            return;
        }

        this.resonanceDisplay.style.display = 'block';
        let html = '<div class="resonance-header">Active Resonances</div>';

        const now = Date.now();
        this.activeChains.forEach(chain => {
            const chainType = this.chainTypes[chain.type];
            const timeElapsed = now - chain.startTime;
            const timeRemaining = Math.max(0, this.chainDecayTime - timeElapsed);
            const timeLeftSeconds = (timeRemaining / 1000).toFixed(1);
            const timerPercent = (timeRemaining / this.chainDecayTime) * 100;

            html += `
                <div class="resonance-chain" style="border-color: ${chainType.color}">
                    <div class="chain-type">${chainType.name} Resonance</div>
                    <div class="chain-details">
                        <span class="chain-words">${chain.words.length} Words</span>
                        <span class="chain-multiplier">×${chain.multiplier.toFixed(1)}</span>
                    </div>
                    <div class="chain-timer-bar" style="width: ${timerPercent}%; background-color: ${chainType.color};"></div>
                    <div class="chain-timer-text">${timeLeftSeconds}s</div>
                </div>
            `;
        });

        this.resonanceDisplay.innerHTML = html;
    }

    getActiveMultiplier() {
        if (this.activeChains.length === 0) return 1;

        // Return the highest multiplier among active chains
        return Math.max(1, ...this.activeChains.map(chain => chain.multiplier));
    }
}