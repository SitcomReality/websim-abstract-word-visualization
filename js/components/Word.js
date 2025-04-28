import { positionRandomly } from 'utils/position.js';
import { createTrail } from 'components/Trail.js';
import { createSpecialEffect } from 'effects/effectManager.js';

export class Word {
    constructor(data, container) {
        this.id = data.id;
        this.text = data.text;
        this.size = data.size;
        this.colors = data.colors;
        this.container = container;
        this.element = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.init();
    }
    
    init() {
        // Create DOM element
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'word';
        this.element.innerHTML = `<span>${this.text}</span>`;
        
        // Set styles
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        
        // Position randomly
        positionRandomly(this.element);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Add event listeners
        this.addEventListeners();
        
        // Start floating animation
        this.startFloatingAnimation();
    }
    
    addEventListeners() {
        // Click event
        this.element.addEventListener('click', () => this.activate());
        
        // Drag events
        this.element.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }
    
    startFloatingAnimation() {
        setInterval(() => {
            if (!this.element.classList.contains('active')) {
                this.element.style.transform = `translate(${Math.sin(Date.now() * 0.001 + parseInt(this.id.charCodeAt(0))) * 10}px, 
                                             ${Math.cos(Date.now() * 0.001 + parseInt(this.id.charCodeAt(0))) * 10}px) 
                                             rotate(${Math.sin(Date.now() * 0.0005) * 5}deg)`;
            }
        }, 50);
    }
    
    activate() {
        // Remove active class from all words
        document.querySelectorAll('.word').forEach(word => word.classList.remove('active'));
        
        // Add active class to this word
        this.element.classList.add('active');
        
        // Create special effect
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);
        
        // Reset after animation duration
        setTimeout(() => {
            this.element.classList.remove('active');
        }, 3000);
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.offsetX = e.clientX - this.element.getBoundingClientRect().left;
        this.offsetY = e.clientY - this.element.getBoundingClientRect().top;
        this.element.style.transition = 'none';
    }
    
    drag(e) {
        if (this.isDragging) {
            const x = e.clientX - this.offsetX;
            const y = e.clientY - this.offsetY;
            this.element.style.left = `${x}px`;
            this.element.style.top = `${y}px`;
            
            // Create trail
            createTrail(e.clientX, e.clientY, this.element, this.container);
        }
    }
    
    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.style.transition = 'transform 0.3s ease-out, opacity 0.3s';
        }
    }
}