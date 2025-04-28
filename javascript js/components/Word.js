import { getRandomPosition } from 'utils/position.js';
import { createTrail } from 'components/Trail.js';
import { createSpecialEffect } from 'effects/effectManager.js';

export class Word {
    constructor(data, container) {
        this.id = data.id;
        this.text = data.text;
        this.size = data.size;
        this.radius = this.size / 2; // Add radius property
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
        this.mass = Math.PI * this.radius * this.radius; // Mass proportional to area
        this.restitution = 0.85; // Bounciness factor for collisions

        // Dragging state
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.dragMoved = false; // Track if drag resulted in movement

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
        // Ensure no initial overlap - this requires checking against other words,
        // which is easier to handle in the engine after all words are created.
        // For now, simple random positioning.
        const initialPosition = getRandomPosition(this.element, this.container);
        this.x = initialPosition.x;
        this.y = initialPosition.y;
        this.updateElementPosition(); // Use a helper to set style

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
            // Reset dragMoved flag after click/mouseup logic
            this.dragMoved = false;
        });

        // Drag events
        this.element.addEventListener('mousedown', (e) => this.startDrag(e));
        // Use window for mousemove and mouseup to capture events even if cursor leaves the element
        window.addEventListener('mousemove', (e) => this.drag(e));
        window.addEventListener('mouseup', (e) => this.endDrag(e));
        // Touch events for mobile
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior like scrolling
            this.startDrag(e.touches[0]);
        }, { passive: false });
        window.addEventListener('touchmove', (e) => {
             if (this.isDragging) {
                 e.preventDefault(); // Prevent scrolling while dragging
                 this.drag(e.touches[0]);
             }
        }, { passive: false });
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
         // Ensure tiny velocities are zeroed out to prevent perpetual creep
        const minSpeed = 0.01;
        if (speed < minSpeed) {
            this.vx = 0;
            this.vy = 0;
        }

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Boundary collision detection
        const containerRect = this.container.getBoundingClientRect();
        // Use this.radius for collision checks
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.size;

        if (this.x < leftBoundary) {
            this.x = leftBoundary;
            this.vx *= -this.restitution; // Bounce with energy loss based on restitution
        } else if (this.x > rightBoundary) {
            this.x = rightBoundary;
            this.vx *= -this.restitution;
        }

        if (this.y < topBoundary) {
            this.y = topBoundary;
            this.vy *= -this.restitution;
        } else if (this.y > bottomBoundary) {
            this.y = bottomBoundary;
            this.vy *= -this.restitution;
        }

        // Apply position to element style
        this.updateElementPosition();
    }

    // Helper function to update element's style based on physics properties
    updateElementPosition() {
         // Using translate for smoother animation
         this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
         // Keep left/top at 0,0 since we use transform
         this.element.style.left = `0px`;
         this.element.style.top = `0px`;
    }

    activate() {
        if (this.element.classList.contains('active')) return; // Don't reactivate if already active

        this.element.classList.add('active');

        // Create special effect at the center of the element
        // Get position from physics state, not bounding client rect, as transform affects it
        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        createSpecialEffect(this.id, centerX, centerY, this.colors.primary);

        // Reset visual state after animation duration
        setTimeout(() => {
            if (this.element && this.element.classList.contains('active')) { // Check if still active
               this.element.classList.remove('active');
            }
        }, 1500); // Shorter active state visual
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragMoved = false; // Reset drag moved flag
        this.element.classList.add('dragging');
        // Calculate offset from the element's *physics* center (x + radius, y + radius)
        // ClientX/Y are relative to viewport, convert physics coords if needed,
        // but since container fills viewport and x/y are relative to container, it should be fine.
        const clientX = e.clientX;
        const clientY = e.clientY;
        this.dragOffsetX = clientX - (this.x + this.radius);
        this.dragOffsetY = clientY - (this.y + this.radius);
        this.vx = 0; // Stop physics movement
        this.vy = 0;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
        // Bring to front
        this.element.style.zIndex = 100;
    }

    drag(e) {
        if (!this.isDragging) return;

        const currentMouseX = e.clientX;
        const currentMouseY = e.clientY;

        // Calculate distance moved to check if it's a real drag vs a click
        const dx = currentMouseX - this.lastMouseX;
        const dy = currentMouseY - this.lastMouseY;
        if (Math.sqrt(dx*dx + dy*dy) > 2) { // Threshold to consider it moved
             this.dragMoved = true;
        }

        // Calculate new desired physics center position
        let newCenterX = currentMouseX - this.dragOffsetX;
        let newCenterY = currentMouseY - this.dragOffsetY;

        // Calculate velocity based on mouse movement delta
        // Apply smoothing/scaling factor for better feel
        const throwFactor = 0.8;
        this.vx = dx * throwFactor;
        this.vy = dy * throwFactor;

        // Update element's physics position (top-left corner)
        this.x = newCenterX - this.radius;
        this.y = newCenterY - this.radius;

        // Clamp position to container boundaries during drag
        const containerRect = this.container.getBoundingClientRect();
        const leftBoundary = 0;
        const rightBoundary = containerRect.width - this.size;
        const topBoundary = 0;
        const bottomBoundary = containerRect.height - this.size;

        this.x = Math.max(leftBoundary, Math.min(this.x, rightBoundary));
        this.y = Math.max(topBoundary, Math.min(this.y, bottomBoundary));

        // Update element style immediately for responsiveness
        this.updateElementPosition();

        // Store current mouse position for next frame's velocity calculation
        this.lastMouseX = currentMouseX;
        this.lastMouseY = currentMouseY;

        // Create trail (use current physics center for trail position)
        createTrail(this.x + this.radius, this.y + this.radius, this.element, this.container);
    }

    endDrag(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.element.classList.remove('dragging');
            this.element.style.zIndex = ''; // Reset z-index

            // If the drag didn't move much, treat it as a click
            if (!this.dragMoved) {
                 this.activate();
            } else {
                // Velocity is already calculated during drag based on last movement
                // Clamp velocity if it's too high after a fast drag/throw
                 const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                 const maxThrowSpeed = this.maxSpeed * 3; // Allow throwing faster than normal max speed
                 if (speed > maxThrowSpeed) {
                    this.vx = (this.vx / speed) * maxThrowSpeed;
                    this.vy = (this.vy / speed) * maxThrowSpeed;
                 }
            }
            // Physics simulation will take over in the next update() call with the calculated vx, vy
        }
        // Reset dragMoved flag after interaction ends
        this.dragMoved = false;
    }

    // Method to apply impulse from collision
    applyImpulse(impulseX, impulseY) {
        this.vx += impulseX / this.mass;
        this.vy += impulseY / this.mass;
    }
}