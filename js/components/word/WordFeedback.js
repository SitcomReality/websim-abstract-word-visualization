export class WordFeedback {
    constructor(core, engine, physics) {
        this.core = core;
        this.engine = engine;
        this.physics = physics; 
    }

    applyActivationAnimation() {
        if (!this.core.element || !this.core.isVisible) return;
        const currentX = this.core.x;
        const currentY = this.core.y;
        const currentTransform = `translate(${currentX}px, ${currentY}px)`;

        this.core.element.animate([
            { transform: `${currentTransform} scale(1)` },
            { transform: `${currentTransform} scale(1.2)` },
            { transform: `${currentTransform} scale(1)` }
        ], {
            duration: 300,
            easing: 'ease-out'
        });
    }

    showCooldownFeedback() {
        if (!this.core.element || !this.core.isVisible) return;

        this.core.element.classList.add('cooldown-flash');
        setTimeout(() => {
            if (this.core.element) this.core.element.classList.remove('cooldown-flash');
        }, 300);
    }

    createFloatingRewardParticles(x, y, amount) {
        if (!this.core.container || amount <= 0 || !this.core.isVisible) return;
        const particleCount = Math.min(Math.ceil(amount / 5), 8); 

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            particle.textContent = i === 0 ? `+${Math.floor(amount)}` : '+';

            particle.style.position = 'absolute';
            particle.style.left = `${x + (Math.random() - 0.5) * 30}px`;
            particle.style.top = `${y}px`;
            particle.style.color = '#4caf50';
            particle.style.fontWeight = 'bold';
            particle.style.fontSize = i === 0 ? '20px' : '14px';
            particle.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
            particle.style.zIndex = '100';
            particle.style.pointerEvents = 'none';
            particle.style.transform = 'translate(-50%, -50%)'; 

            this.core.container.appendChild(particle);

            const angle = (Math.random() * Math.PI) - (Math.PI/2); 
            const speed = 2 + Math.random() * 3; 

            particle.animate([
                { transform: 'translate(-50%, -50%)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * 100 - 50}px, ${Math.sin(angle) * 100 - 50}px) scale(${i === 0 ? 1.2 : 0.8})`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)'
            }).onfinish = () => {
                if (this.core.container && this.core.container.contains(particle)) {
                    this.core.container.removeChild(particle);
                }
            };
        }
    }

    showMultiplierEffect(multiplier) {
        if (!this.core.container || !this.core.isVisible) return;
        const multiplierEl = document.createElement('div');
        multiplierEl.className = 'word-multiplier';
        multiplierEl.textContent = `×${multiplier.toFixed(1)}`;

        multiplierEl.style.position = 'absolute';
        multiplierEl.style.left = `${this.core.x + this.core.radius}px`; 
        multiplierEl.style.top = `${this.core.y - 20}px`; 
        multiplierEl.style.color = '#ff9800';
        multiplierEl.style.fontWeight = 'bold';
        multiplierEl.style.fontSize = '1.2em';
        multiplierEl.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        multiplierEl.style.pointerEvents = 'none';
        multiplierEl.style.zIndex = '200';
        multiplierEl.style.transform = 'translate(-50%, -50%)';

        this.core.container.appendChild(multiplierEl);

        multiplierEl.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
            { opacity: 1, transform: 'translate(-50%, -80%) scale(1)' }, 
            { opacity: 0, transform: 'translate(-50%, -120%) scale(0.9)' } 
        ], {
            duration: 1200,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.core.container && this.core.container.contains(multiplierEl)) {
                this.core.container.removeChild(multiplierEl);
            }
        };
    }

    showCategoryFeedback(message, isSuccess = false) {
        if (!this.core.container || !this.core.isVisible) return;

        const feedback = document.createElement('div');
        feedback.className = 'category-feedback';
        feedback.textContent = message;

        feedback.style.position = 'absolute';
        feedback.style.left = `${this.core.x + this.core.radius}px`;
        feedback.style.top = `${this.core.y - 30}px`; 
        feedback.style.color = isSuccess ? '#4caf50' : '#f44336';
        feedback.style.fontWeight = 'bold';
        feedback.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';
        feedback.style.backgroundColor = 'rgba(0,0,0,0.7)';
        feedback.style.padding = '5px 10px';
        feedback.style.borderRadius = '5px';
        feedback.style.zIndex = '200';
        feedback.style.pointerEvents = 'none';
        feedback.style.transform = 'translate(-50%, -50%)'; 
        feedback.style.whiteSpace = 'nowrap'; 

        this.core.container.appendChild(feedback);

        feedback.animate([
            { opacity: 0, transform: 'translate(-50%, -50%)' },
            { opacity: 1, transform: 'translate(-50%, -60%)' }, 
            { opacity: 0, transform: 'translate(-50%, -80%)' } 
        ], {
            duration: 1500,
            easing: 'ease-out'
        }).onfinish = () => {
            if (this.core.container && this.core.container.contains(feedback)) {
                this.core.container.removeChild(feedback);
            }
        };
    }

    updateResonanceVisuals() {
        if (!this.core.element || !this.core.isVisible || this.engine.gameState.currentScreen !== 'game') {
            if (this.core.element) this.core.element.classList.remove('resonance-ready');
            return;
        }

        const canResonate = this.engine.resonanceSystem?.canFormResonance(this.core);

        if (canResonate) {
            this.core.element.classList.add('resonance-ready');
        } else {
            this.core.element.classList.remove('resonance-ready');
        }
    }
}