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
            // Etymological connections
            logos_aether: 'ETYMOLOGICAL',
            logos_quintessence: 'ETYMOLOGICAL',
            kairos_monad: 'ETYMOLOGICAL',
            
            // Semantic connections
            apeiron_entropy: 'SEMANTIC',
            aether_anima: 'SEMANTIC',
            monad_logos: 'SEMANTIC',
            
            // Phonetic connections
            kairos_anima: 'PHONETIC',
            logos_monad: 'PHONETIC',
            
            // Chromatic connections (based on complementary colors)
            entropy_quintessence: 'CHROMATIC',
            apeiron_monad: 'CHROMATIC'
        };
        
        this.lastActivatedWord = null;
        this.activationTimeout = null;
        this.chainDecayTime = 6000; // 6 seconds until chain decays
        
        this.resonanceDisplay = null;
        this.initResonanceDisplay();
    }
    
    initResonanceDisplay() {
        this.resonanceDisplay = document.createElement('div');
        this.resonanceDisplay.id = 'resonance-display';
        document.getElementById('game-screen').appendChild(this.resonanceDisplay);
    }
    
    wordActivated(word) {
        if (!this.lastActivatedWord) {
            this.lastActivatedWord = word;
            this.startChainTimer();
            return 1; // No chain yet
        }
        
        // Check for affinities between current and last word
        const chainKey1 = `${this.lastActivatedWord.id}_${word.id}`;
        const chainKey2 = `${word.id}_${this.lastActivatedWord.id}`;
        const chainType = this.wordAffinities[chainKey1] || this.wordAffinities[chainKey2];
        
        if (chainType) {
            clearTimeout(this.activationTimeout);
            this.startChainTimer();
            
            // Find existing chain or create new one
            let chain = this.activeChains.find(c => c.type === chainType);
            if (!chain) {
                chain = {
                    type: chainType,
                    words: [this.lastActivatedWord],
                    multiplier: this.chainTypes[chainType].multiplier,
                    startTime: Date.now()
                };
                this.activeChains.push(chain);
            }
            
            // Add word to chain if not already in it
            if (!chain.words.includes(word)) {
                chain.words.push(word);
                chain.multiplier += 0.2; // Increase multiplier with each new word
            }
            
            this.lastActivatedWord = word;
            this.updateResonanceDisplay();
            
            // Return the current chain multiplier
            return chain.multiplier;
        } else {
            // No resonance found, but still track as last word
            clearTimeout(this.activationTimeout);
            this.startChainTimer();
            this.lastActivatedWord = word;
            
            return 1; // No chain multiplier
        }
    }
    
    startChainTimer() {
        this.activationTimeout = setTimeout(() => {
            this.lastActivatedWord = null;
            this.activeChains = [];
            this.updateResonanceDisplay();
        }, this.chainDecayTime);
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
        
        this.activeChains.forEach(chain => {
            const chainType = this.chainTypes[chain.type];
            const timeLeft = Math.max(0, (chain.startTime + this.chainDecayTime - Date.now()) / 1000).toFixed(1);
            
            html += `
                <div class="resonance-chain" style="border-color: ${chainType.color}">
                    <div class="chain-type">${chainType.name} Resonance</div>
                    <div class="chain-details">
                        <span class="chain-words">${chain.words.length} Words</span>
                        <span class="chain-multiplier">×${chain.multiplier.toFixed(1)}</span>
                    </div>
                    <div class="chain-timer" style="background: linear-gradient(to right, ${chainType.color} ${(timeLeft/6)*100}%, transparent)">
                        ${timeLeft}s
                    </div>
                </div>
            `;
        });
        
        this.resonanceDisplay.innerHTML = html;
    }
    
    getActiveMultiplier() {
        if (this.activeChains.length === 0) return 1;
        
        // Return the highest active multiplier
        return Math.max(...this.activeChains.map(chain => chain.multiplier));
    }
}