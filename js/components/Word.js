import { getRandomPosition } from 'utils/position.js';
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
        
        // Physics properties
        this.x = 0;
        this.y = 0;
        this.vx = (Math.random() - 0.5) * 2; // Initial velocity
        this.vy = (Math.random() - 0.5) * 2;
        this.damping = 0.98; // Damping factor for slowing down
        this.pushForce = 0.05; // Gentle floating force magnitude
        this.maxSpeed = 3; // Maximum speed for floating
        this.mass = this.size * this.size; // Mass proportional to area
        this.restitution = 0.8 + (Math.random() * 0.15); // Bounciness factor for collisions (slightly randomized)
        
        this.init();
    }
    
    init() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'word';
        this.element.innerHTML = `<span>${this.text}</span>`;

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle, ${this.colors.primary}, ${this.colors.secondary})`;
        this.element.style.position = 'absolute'; // Ensure position is absolute for transform to work correctly
        this.element.style.left = '0px'; // Set initial left/top to 0 for transform positioning
        this.element.style.top = '0px';

        this.container.appendChild(this.element);

        // Get random position and set initial physics coordinates
        const initialPosition = getRandomPosition(this.element, this.container);
        this.x = initialPosition.x;
        this.y = initialPosition.y;

        // Update element's visual position based on physics coordinates
        this.updateElementPosition();

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
                this.update();
            }
        }, 16);
    }
    
    update(dt = 1) {
        // Apply gentle random floating force with periodic pattern
        const time = Date.now() * 0.001;
        const floatX = Math.sin(time * 0.7 + this.id.charCodeAt(0)) * this.pushForce * dt;
        const floatY = Math.cos(time * 0.5 + this.id.charCodeAt(0)) * this.pushForce * dt;
        this.vx += floatX + (Math.random() - 0.5) * this.pushForce * 0.5 * dt;
        this.vy += floatY + (Math.random() - 0.5) * this.pushForce * 0.5 * dt;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = this.vx / speed * this.maxSpeed;
            this.vy = this.vy / speed * this.maxSpeed;
        }
        
        // Apply damping
        this.vx *= this.damping;
        this.vy *= this.damping;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update element position
        this.updateElementPosition();
    }
    
    updateElementPosition() {
        // Use translate for positioning, ensuring left/top are 0 in CSS or style init
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
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
        if (!this.isDragging) return;

        const x = e.clientX - this.offsetX;
        const y = e.clientY - this.offsetY;
        this.element.style.transform = `translate(${x}px, ${y}px)`;
        
        // Update physics position
        this.x = x;
        this.y = y;
        
        // Create trail with color from this word (use current physics center for trail position)
        createTrail(this.x + this.size / 2, this.y + this.size / 2, this.element, this.container, this.colors.primary);
    }
    
    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.style.transition = 'transform 0.3s ease-out, opacity 0.3s';
        }
    }
}