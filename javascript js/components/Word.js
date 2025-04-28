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

        // Physics properties
        this.x = 0;
        this.y = 0;
        this.vx = (Math.random() - 0.5) * 2; // Initial velocity
        this.vy = (Math.random() - 0.5) * 2;
        this.damping = 0.98; // Damping factor for slowing down
        this.pushForce = 0.05; // Gentle floating force magnitude
        this.maxSpeed = 3; // Maximum speed for floating

        // Dragging state
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

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
        this.element.style.position = 'absolute'; // Ensure position is absolute

        // Position randomly and store coordinates
        const initialPosition = getRandomPosition(this.element, this.container);
        this.x = initialPosition.x;
        this.y = initialPosition.y;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        // Add to container
        this.container.appendChild(this.element);

        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Click event
        this.element.addEventListener('click', (e) => {
             // Prevent click activation if it was part of a drag
             if (!this.dragMoved) {
                this.activate();
            }
        });

        // Drag events
        this.element.addEventListener('mousedown', (e) => this.startDrag(e));
        // Use window for mousemove and mouseup to capture events even if cursor leaves the element
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', (e) => this.endDrag(e));
        // Touch events for mobile
        this.element.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: false });
        window.addEventListener('touchmove', (e) => this.drag(e.touches[0]), { passive: false });
        window.addEventListener('touchend', (e) => this.endDrag(e.changedTouches[0]));
    }

    update(dt = 1) { // dt defaults to 1 if not provided
        if (this.isDragging) return; // Physics simulation paused while dragging

        // Apply gentle random floating force
        this.vx += (Math.random() - 0.5) * this.pushForce * dt;
        this.vy += (Math.random() - 0.5) * this.pushForce * dt;

        // Apply damping
        this.vx *= this.damping;
        this.vy *= this.damping;

        // Clamp speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Boundary collision detection
        const containerRect = this.container.getBoundingClientRect();
        const elementRect = this.element.getBoundingClientRect(); // Use current rect for size

        if (this.x < 0) {
            this.x = 0;
            this.vx *= -0.8; // Bounce with energy loss
        } else if (this.x + elementRect.width > containerRect.width) {
            this.x = containerRect.width - elementRect.width;
            this.vx *= -0.8;
        }

        if (this.y < 0) {
            this.y = 0;
            this.vy *= -0.8;
        } else if (this.y + elementRect.height > containerRect.height) {
            this.y = containerRect.height - elementRect.height;
            this.vy *= -0.8;
        }


        // Apply position to element style
        this.element.style.transform = `translate(${this.x - parseFloat(this.element.style.left || 0)}px, ${this.y - parseFloat(this.element.style.top || 0)}px)`;
        // Update base position less frequently or use transform only
        // For simplicity now, we'll just use transform for physics movement
         this.element.style.left = `${this.x}px`;
         this.element.style.top = `${this.y}px`;
         this.element.style.transform = `translate(0, 0)`; // Reset transform after applying to left/top

        // Add subtle rotation based on velocity? Maybe later.
    }


    activate() {
        if (this.element.classList.contains('active')) return; // Don't reactivate if already active

        // Remove active class from all other words potentially
        // document.querySelectorAll('.word.active').forEach(word => word.classList.remove('active'));

        this.element.classList.add('active');

        // Create special effect at the center
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);

        // Reset visual state after animation duration
        setTimeout(() => {
            if (this.element) { // Check if element still exists
               this.element.classList.remove('active');
            }
        }, 1500); // Shorter active state visual
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragMoved = false; // Flag to check if drag actually moved
        this.element.classList.add('dragging'); // Add dragging class for potential style changes
        // Calculate offset from the element's current *visual* center
        const rect = this.element.getBoundingClientRect();
        this.dragOffsetX = e.clientX - (rect.left + rect.width / 2);
        this.dragOffsetY = e.clientY - (rect.top + rect.height / 2);
        this.vx = 0; // Stop physics movement
        this.vy = 0;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        // Bring to front
        this.element.style.zIndex = 100;
    }

    drag(e) {
        if (!this.isDragging) return;
        this.dragMoved = true; // Mark as moved

        const currentMouseX = e.clientX;
        const currentMouseY = e.clientY;

        // Calculate new desired center position
        let newX = currentMouseX - this.dragOffsetX;
        let newY = currentMouseY - this.dragOffsetY;

        // Calculate velocity based on mouse movement delta
        // We apply this velocity on endDrag
        this.vx = (currentMouseX - this.lastMouseX) * 0.5; // Multiply for smoother throw
        this.vy = (currentMouseY - this.lastMouseY) * 0.5;


        // Update element's position directly (center-based)
        const elementRect = this.element.getBoundingClientRect();
        this.x = newX - elementRect.width / 2;
        this.y = newY - elementRect.height / 2;

        // Update element style immediately for responsiveness
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `translate(0, 0)`; // Clear transform if we set left/top

        // Store current mouse position for next frame's velocity calculation
        this.lastMouseX = currentMouseX;
        this.lastMouseY = currentMouseY;

        // Create trail (use current mouse position for trail start)
        createTrail(currentMouseX, currentMouseY, this.element, this.container);
    }

    endDrag(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.classList.remove('dragging');
            this.element.style.zIndex = ''; // Reset z-index

            // If the drag didn't move much, treat it as a click
            if (!this.dragMoved) {
                 this.activate();
            }

            // Velocity is already calculated during drag based on last movement
            // Physics simulation will take over in the next update() call
        }
    }
}