# WordSphere: Lexical Physics - Game Design Document

## Overview
WordSphere is an interactive web-based experience that transforms abstract words into tangible, interactive entities within a physics playground. Players interact with word-bubbles through movement, clicks, and drags, triggering unique visual effects while progressing through an addictive loop of collection, combination, and creation.

## Core Design Philosophy
- **Visual Abstraction**: Transform linguistic concepts into visual experiences
- **Playful Interaction**: Encourage exploration through organic, intuitive interactions
- **Synesthetic Experience**: Create associations between words, movements, colors, and effects
- **Emergent Gameplay**: Allow users to discover interactions rather than explicitly teaching them
- **Compulsion Loop**: Balance skill expression, progression, and randomized rewards

## Core Mechanics

### Word Bubbles
- Each abstract word exists as a floating bubble in the space
- Words have unique:
  - Colors (primary and secondary gradient)
  - Size / Radius / Mass
  - Effect type
  - Movement patterns (Physics-based: velocity, damping, random push, boundary collision, inter-word collision)
  - Rarity tier (Common, Uncommon, Rare, Epic, Legendary)
  - Energy potential and generation rate

### Interaction Mechanics
1. **Floating Animation**: Words gently float based on simple physics simulation (velocity, damping, small random forces). They bounce off screen edges and each other.
2. **Click Activation**: Clicking (or tapping) a word activates its special effect and harvests energy. Activates only if not part of a drag action.
3. **Dragging**: Users can drag words around the screen using mouse or touch. Dragging imparts velocity for a "throw" effect on release.
4. **Trail Generation**: Dragging words leaves ephemeral trails behind.
5. **Effect Triggering**: Each word creates a unique visual effect when activated (clicked/tapped).
6. **Collision**: Words collide with each other realistically, based on their mass and bounciness (restitution). Overlapping words are pushed apart.

### New Core Systems

#### Energy Harvesting & Progression System
- Each word generates energy when clicked
- Energy harvesting rate based on:
  - Word rarity tier
  - Time since last click (critical timing bonus)
  - Current resonance chains (combos)
  - Lexical affinity connections
- Energy used to unlock:
  - New word slots
  - Word upgrades
  - Special abilities
  - Environmental modifiers

#### Lexical Resonance Chains
- Clicking words in specific patterns creates resonance chains
- Different chain types:
  - **Etymological**: Words sharing linguistic roots
  - **Semantic**: Words with related meanings
  - **Phonetic**: Words with similar sounds
  - **Chromatic**: Words with complementary colors
- Chain bonuses:
  - Energy multipliers
  - Temporary effect enhancement
  - Chance to spawn rare word fragments

#### Word Fusion & Evolution
- Drag two compatible words together to attempt fusion
- Fusion success based on:
  - Lexical affinity score
  - Energy investment
  - RNG factor (influenced by player luck stat)
- Successful fusion creates:
  - New hybrid word with combined properties
  - Possible discovery of legendary words
  - Emergent effects from new combinations

#### Bullet Patterns & Projectile Systems
- Words can emit patterned projectiles when activated
- Projectile types:
  - **Lexemes**: Fast, straight-line projectiles that split words they hit
  - **Phonemes**: Curved projectiles that temporarily boost word energy generation
  - **Morphemes**: Homing projectiles that create temporary word bindings
- Pattern complexity increases with word rarity
- Skill-based interception for bonus effects

#### World Events & Challenges
- Timed events affect gameplay environment:
  - **Lexical Storm**: Increased word movement, higher energy generation
  - **Semantic Shift**: Words temporarily change meanings and effects
  - **Etymological Regression**: Ancient word forms appear with high value
- Challenge phases require strategic response:
  - Target energy harvesting quotas
  - Create specific resonance patterns
  - Defend valuable words from decay

#### Word Property Matrix
- Each word has a property matrix (Excel-like stats)
- Core properties:
  - Energy potential (base energy generation)
  - Resonance factor (chain multiplier)
  - Stability (resistance to movement)
  - Volatility (random effect chance)
  - Clarity (effect potency)
  - Affinity (fusion compatibility)
- Properties can be upgraded through progression

### Effect System
Each word has a signature effect that represents its abstract meaning:

| Word | Effect Type | Visual Representation | Gameplay Effect |
|------|-------------|------------------------|-----------------|
| Smorma | Explosion | Particles radiating outward | Pushes other words away, energy burst |
| Pips | Spiral | Particles moving in spiral patterns | Creates vortex, attracts nearby words |
| Tine | Wave | Concentric rings expanding outward | Temporarily increases all words' energy generation |
| Elusive | Fade | Particles that fade in and out | Creates "ghost" copies that generate bonus energy |
| Paradiastolic | Pulse | Rhythmic pulsating circles | Synchronizes nearby words for chain bonuses |
| Perihelion | Orbit | Particles orbiting around a central point | Creates satellite words that orbit and boost the primary word |
| Scolflocs | Rain | Particles falling like raindrops | Scattered energy drops that can be collected |
| Hyperbolic | Hyper | Particles accelerating along hyperbolic curves | Temporarily accelerates all physics, increasing chaos and potential rewards |

### Roguelike Elements
- **Procedural Generation**: Each play session generates a unique word pool
- **Persistent Upgrades**: Meta-progression between sessions
- **Run-based Progression**: Limited time or energy each "run" before reset
- **Random Encounters**: Unexpected word phenomena and rare discoveries
- **Risk/Reward Decisions**: Invest in current words or save for future opportunities

### Word Construction System
- Players can discover word fragments from activations and fusions
- Fragments can be assembled into custom words with player-selected properties
- Custom words inherit properties based on their fragments
- Mechanical assembly interface inspired by the Wild Wild West mechanical spider:
  - Connect fragments through intricate clockwork mechanisms
  - Balance word properties through gear ratios and linkages
  - Add decorative elements for personalization

## Visual Design
- **Color Palette**: Vibrant, contrasting colors that pair well together
- **Motion Design**: Smooth, fluid animations with physics-based movement and organic easing functions
- **Particle Effects**: Dynamic, procedurally-generated particle systems for word activation effects
- **Minimalist UI**: Focus on the interaction rather than interface elements. Splash screen for entry
- **Construction Interface**: Steampunk-inspired mechanical assembly system for word creation

## Audio Design (Future)
- Ambient background soundscape that evolves with gameplay
- Unique sound for each word effect activation
- Sound cues for collisions (pitch/volume based on impact force)
- Interactive audio that responds to user actions (e.g., dragging speed)
- Generative audio system tied to visual elements
- Progression jingles and achievement fanfares

## Expansion Roadmap

### Phase 1: Core Experience (Complete)
- Basic word properties (color, size, text, mass)
- Splash screen entry
- Physics-based floating and boundary collision
- Click/Tap activation of individual word effects
- Drag and Throw interaction
- Trail generation during drag
- Basic Word-Word Collision (Detection and Response)

### Phase 2: Progression Systems (Next)
- Energy harvesting from word activation
- Basic upgrade system for words and environment
- Word property matrix implementation
- Resonance chain system
- Simple fusion mechanics

### Phase 3: Enhanced Mechanics
- Bullet pattern systems
- World events and challenges
- Advanced word construction system
- Mechanical assembly interface
- Meta-progression between sessions

### Phase 4: Advanced Features
- Multiplayer cooperative lexical construction
- Competitive word battles
- Community word sharing
- Advanced procedural generation
- Narrative elements and lore discovery

## Balance Philosophy
- **Skill vs. Luck**: 60/40 balance favoring skill expression
- **Short vs. Long-term**: Balance immediate rewards with long-term investment
- **Active vs. Passive**: Reward active play while allowing some idle progression
- **Complexity vs. Accessibility**: Layer complexity gradually, maintain core simplicity
- **Chaos vs. Control**: Allow for both strategic planning and opportunistic reactions

## Player Progression Curve
1. **Discovery**: Learning basic interactions and word properties
2. **Collection**: Gathering initial set of words and energy
3. **Optimization**: Learning to create and maximize resonance chains
4. **Experimentation**: Trying different word combinations and constructions
5. **Mastery**: Creating optimal lexical systems and maximizing energy flow

