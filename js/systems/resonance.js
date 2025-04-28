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
                
                // Show special effect for new chain
                this.showChainStartEffect(chain);
            }
            
            // Add word to chain if not already in it
            if (!chain.words.includes(word)) {
                chain.words.push(word);
                chain.multiplier += 0.2; // Increase multiplier with each new word
                
                // Show connection effect between words
                this.showConnectionEffect(this.lastActivatedWord, word, this.chainTypes[chainType].color);
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
    
    canFormResonance(word) {
        if (!this.lastActivatedWord || word === this.lastActivatedWord) return false;
        
        const chainKey1 = `${this.lastActivatedWord.id}_${word.id}`;
        const chainKey2 = `${word.id}_${this.lastActivatedWord.id}`;
        return !!(this.wordAffinities[chainKey1] || this.wordAffinities[chainKey2]);
    }
    
    startChainTimer() {
        this.activationTimeout = setTimeout(() => {
            this.lastActivatedWord = null;
            this.activeChains = [];
            this.updateResonanceDisplay();
        }, this.chainDecayTime);
    }
    
    showChainStartEffect(chain) {
        // Create a particle burst for new chain
        const container = document.getElementById('game-screen');
        if (!container) return;
        
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
            particle.style.bottom = '20px';
            particle.style.left = '20px';
            particle.style.opacity = '0.8';
            particle.style.zIndex = '110';
            particle.style.pointerEvents = 'none';
            
            container.appendChild(particle);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            
            particle.animate([
                { transform: 'translate(0, 0)', opacity: 0.8 },
                { 
                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`, 
                    opacity: 0 
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (container.contains(particle)) {
                    container.removeChild(particle);
                }
            };
        }
    }
    
    showConnectionEffect(word1, word2, color) {
        const container = document.getElementById('game-screen');
        if (!container || !word1 || !word2) return;
        
        const x1 = word1.x + word1.radius;
        const y1 = word1.y + word1.radius;
        const x2 = word2.x + word2.radius;
        const y2 = word2.y + word2.radius;
        
        // Create a connecting line
        const connection = document.createElement('div');
        connection.className = 'resonance-connection';
        
        // Calculate line properties
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Position the line
        connection.style.position = 'absolute';
        connection.style.width = `${length}px`;
        connection.style.height = '3px';
        connection.style.background = color;
        connection.style.left = `${x1}px`;
        connection.style.top = `${y1}px`;
        connection.style.transformOrigin = '0 50%';
        connection.style.transform = `rotate(${angle}deg)`;
        connection.style.opacity = '0.7';
        connection.style.zIndex = '95';
        connection.style.pointerEvents = 'none';
        container.appendChild(connection);
        
        // Animate the connection
        connection.animate([
            { opacity: 0.7, height: '3px' },
            { opacity: 0, height: '8px' }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
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