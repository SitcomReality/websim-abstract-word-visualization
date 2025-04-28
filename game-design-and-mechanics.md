# Abstract Word Visualization - Game Design Document

## Overview
Abstract Word Visualization is an interactive web-based experience that transforms abstract words and phrases into tangible, interactive visual elements. Users can interact with these word-bubbles through movement, clicks, and drags, triggering unique visual effects associated with each word concept.

## Core Design Philosophy
- **Visual Abstraction**: Transform linguistic concepts into visual experiences
- **Playful Interaction**: Encourage exploration through organic, intuitive interactions
- **Synesthetic Experience**: Create associations between words, movements, colors, and effects
- **Emergent Gameplay**: Allow users to discover interactions rather than explicitly teaching them

## Core Mechanics

### Word Bubbles
- Each abstract word exists as a floating bubble in the space
- Words have unique:
  - Colors (primary and secondary gradient)
  - Size / Radius / Mass
  - Effect type
  - Movement patterns (Physics-based: velocity, damping, random push, boundary collision, inter-word collision)

### Interaction Mechanics
1. **Floating Animation**: Words gently float based on simple physics simulation (velocity, damping, small random forces). They bounce off screen edges and each other.
2. **Click Activation**: Clicking (or tapping) a word activates its special effect. Activates only if not part of a drag action.
3. **Dragging**: Users can drag words around the screen using mouse or touch. Dragging imparts velocity for a "throw" effect on release.
4. **Trail Generation**: Dragging words leaves ephemeral trails behind.
5. **Effect Triggering**: Each word creates a unique visual effect when activated (clicked/tapped).
6. **Collision**: Words collide with each other realistically, based on their mass and bounciness (restitution). Overlapping words are pushed apart.

### Effect System
Each word has a signature effect that represents its abstract meaning:

| Word | Effect Type | Visual Representation |
|------|-------------|------------------------|
| Smorma | Explosion | Particles radiating outward in all directions |
| Pips | Spiral | Particles moving in spiral patterns |
| Tine | Wave | Concentric rings expanding outward |
| Elusive | Fade | Particles that fade in and out randomly |
| Paradiastolic | Pulse | Rhythmic pulsating circles |
| Perihelion | Orbit | Particles orbiting around a central point |
| Scolflocs | Rain | Particles falling like raindrops |
| Hyperbolic | Hyper | Particles accelerating along hyperbolic curves |

## Visual Design
- **Color Palette**: Vibrant, contrasting colors that pair well together
- **Motion Design**: Smooth, fluid animations with physics-based movement and organic easing functions.
- **Particle Effects**: Dynamic, procedurally-generated particle systems for word activation effects.
- **Minimalist UI**: Focus on the interaction rather than interface elements. Splash screen for entry.

## Audio Design (Future)
- Ambient background soundscape
- Unique sound for each word effect activation
- Sound cues for collisions (pitch/volume based on impact force?)
- Interactive audio that responds to user actions (e.g., dragging speed)
- Generative audio system tied to visual elements

## Progression Mechanics (Future)
- Unlockable words/concepts
- Effect combinations when words interact with each other (e.g., colliding words trigger combined/modified effects)
- User-generated word creation system
- Story/narrative elements revealed through interaction

## Technical Implementation
- Modular component-based architecture (`Word`, `Trail`, etc.)
- Effect manager system (`effectManager.js`) handling various visual effects (`explosion.js`, `spiral.js`, etc.)
- Position and animation utilities (`position.js`)
- Core game engine (`engine.js`) with state management, game loop, physics updates, and collision handling.
- Screen system (`splash.js`, `game.js`) for different application states (splash, game).
- Configuration constants (`constants.js`).

## Expansion Roadmap

### Phase 1: Core Experience (Mostly Complete)
- Basic word properties (color, size, text, mass)
- Splash screen entry
- Physics-based floating and boundary collision
- Click/Tap activation of individual word effects
- Drag and Throw interaction
- Trail generation during drag
- Basic Word-Word Collision (Detection and Response)

### Phase 2: Enhanced Interaction & Polish
- Effect combinations (e.g., triggered on collision)
- Collision Effects (visual cue on impact)
- Improved physics (e.g., rotational velocity, friction?)
- Audio implementation (background, activation, collision sounds)
- Performance optimization for many words/effects

### Phase 3: Progression System
- User accounts (optional, perhaps local storage first)
- Word unlocking mechanics
- Achievement system
- Personal word creation/customization

### Phase 4: Social Features
- Shared spaces (e.g., using WebSockets)
- Collaborative creation
- Community galleries

## Design Principles
1. **Discovery over Instruction**: Let users learn through play
2. **Beauty in Abstraction**: Embrace the abstract nature of the concepts
3. **Responsive Feedback**: Every

