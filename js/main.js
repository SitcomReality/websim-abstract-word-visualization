import { Engine } from 'core/engine.js';
import { WORDS_DATA } from 'config/constants.js';

// Enhance philosophical descriptions to better support the theme
const PHILOSOPHICAL_DESCRIPTIONS = {
    logos: "Universal reason and rational order - the organizing principle of reality",
    kairos: "The perfect moment of opportunity - when time becomes qualitative",
    aether: "The material that fills the region of the universe - the quintessential medium",
    apeiron: "The boundless and unformed infinite - source of all definite things",
    quintessence: "The fifth essence above the mundane elements - the celestial substance",
    monad: "The totality of all beings as unity - the indivisible foundation",
    anima: "The principle of life and consciousness - vital force of existence",
    entropy: "The principle of disorder and randomness - inevitable cosmic dissipation"
};

// Attach enhanced descriptions to words
WORDS_DATA.forEach(word => {
    word.description = PHILOSOPHICAL_DESCRIPTIONS[word.id] || "";
});

document.addEventListener('DOMContentLoaded', () => {
    const engine = new Engine();
    engine.init();
});

