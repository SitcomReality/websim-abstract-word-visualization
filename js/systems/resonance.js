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

        // --- New properties for connection visuals ---
        this.connections = []; // Stores { word1, word2, color, element }
        this.connectionUpdateTimer = 0;
        this.connectionVisibleDuration = 100; // ms - How long the line stays visible after update
        this.connectionUpdateInterval = 250; // ms - How often to update and show the line
        // --- End new properties ---
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
            this.clearAllConnectionVisuals(); // Clear connections if starting new chain
            this.updateAllWordVisuals(); // Update indicators based on new last word
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
                // Create visual connection when adding a NEW word to the chain
                this.createConnectionVisual(this.lastActivatedWord, word, chainType.color);
            }

            this.lastActivatedWord = word;
            this.updateResonanceDisplay();

            currentMultiplier = chain.multiplier;
        } else {
             // Chain broken or different type attempted
            this.lastActivatedWord = word;
            this.clearAllChainsAndVisuals(); // Clear chains and connections
            this.startChainTimer(); // Start timer for the new single word
            currentMultiplier = 1;
        }

        this.updateAllWordVisuals();

        return currentMultiplier;
    }

    canFormResonance(word) {
        if (!this.lastActivatedWord || word === this.lastActivatedWord || !this.lastActivatedWord.element || !word.element) return false;

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
            this.clearAllChainsAndVisuals();
        }, this.chainDecayTime);
    }

    clearAllChainsAndVisuals() {
        this.lastActivatedWord = null;
        this.activeChains = [];
        this.clearAllConnectionVisuals();
        this.updateResonanceDisplay();
        this.updateAllWordVisuals(); // Ensure resonance indicators are cleared
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

    // --- New Connection Visual Logic ---

    createConnectionVisual(word1, word2, color) {
        const container = this.engine.container;
        if (!container || !word1 || !word2 || !word1.element || !word2.element) return;

        const connectionElement = document.createElement('div');
        connectionElement.className = 'resonance-connection';
        connectionElement.style.position = 'absolute';
        connectionElement.style.height = '3px'; // Line thickness
        connectionElement.style.background = `linear-gradient(to right, transparent, ${color}ff, transparent)`;
        connectionElement.style.transformOrigin = '0 50%';
        connectionElement.style.opacity = '0'; // Start invisible
        connectionElement.style.zIndex = '95';
        connectionElement.style.pointerEvents = 'none';
        connectionElement.style.borderRadius = '2px';
        // Add transition for smooth fade in/out
        connectionElement.style.transition = `opacity ${this.connectionVisibleDuration / 1000}s ease-out`;

        container.appendChild(connectionElement);

        this.connections.push({
            word1,
            word2,
            color,
            element: connectionElement,
            visibleTimeout: null // Store timeout reference
        });
    }

    updateConnectionVisuals(dt) {
        const container = this.engine.container;
        if (!container) return;

        this.connectionUpdateTimer += dt * 1000; // dt is in seconds

        // Check if it's time to update and flash the connections
        const needsUpdate = this.connectionUpdateTimer >= this.connectionUpdateInterval;

        // Filter out connections where a word no longer exists or its element is gone
        this.connections = this.connections.filter(conn => {
            if (!conn.word1 || !conn.word1.element || conn.word1.isBeingDestroyed ||
                !conn.word2 || !conn.word2.element || conn.word2.isBeingDestroyed) {
                // Word is gone, remove the element immediately
                if (conn.element && container.contains(conn.element)) {
                    container.removeChild(conn.element);
                }
                 if (conn.visibleTimeout) clearTimeout(conn.visibleTimeout); // Clear any pending fade-out
                return false; // Remove from connections array
            }
            return true; // Keep the connection
        });

        if (needsUpdate) {
             this.connectionUpdateTimer = 0; // Reset timer

             this.connections.forEach(conn => {
                 // Ensure elements still exist before proceeding
                 if (!conn.element || !conn.word1.element || !conn.word2.element) return;

                 const x1 = conn.word1.x + conn.word1.radius;
                 const y1 = conn.word1.y + conn.word1.radius;
                 const x2 = conn.word2.x + conn.word2.radius;
                 const y2 = conn.word2.y + conn.word2.radius;

                 const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                 const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

                 // Update position and appearance
                 conn.element.style.left = `${x1}px`;
                 conn.element.style.top = `${y1}px`;
                 conn.element.style.width = `${length}px`;
                 conn.element.style.transform = `rotate(${angle}deg)`;
                 conn.element.style.background = `linear-gradient(to right, transparent, ${conn.color}ff, transparent)`; // Update color just in case

                 // Make it visible
                 conn.element.style.opacity = '0.7';

                 // Clear any previous timeout to hide it
                 if (conn.visibleTimeout) {
                     clearTimeout(conn.visibleTimeout);
                 }

                 // Set a new timeout to hide it again
                 conn.visibleTimeout = setTimeout(() => {
                     if (conn.element) { // Check if element still exists
                         conn.element.style.opacity = '0';
                     }
                     conn.visibleTimeout = null; // Clear timeout reference
                 }, this.connectionVisibleDuration);
             });
        }
    }

    clearAllConnectionVisuals() {
        const container = this.engine.container;
        if (!container) return;

        this.connections.forEach(conn => {
            if (conn.element && container.contains(conn.element)) {
                container.removeChild(conn.element);
            }
            if (conn.visibleTimeout) {
                clearTimeout(conn.visibleTimeout);
            }
        });
        this.connections = []; // Clear the array
        this.connectionUpdateTimer = 0; // Reset timer
    }

    // --- End New Connection Visual Logic ---

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