import { Engine } from 'core/engine.js';
import { WORDS_DATA } from 'config/constants.js';

// Add philosophical descriptions to words
const PHILOSOPHICAL_DESCRIPTIONS = {
    logos: "Universal reason and rational order",
    kairos: "The perfect moment of opportunity",
    aether: "The material that fills the region of the universe",
    apeiron: "The boundless and unformed infinite",
    quintessence: "The fifth essence above the mundane elements",
    monad: "The totality of all beings as unity",
    anima: "The principle of life and consciousness",
    entropy: "The principle of disorder and randomness"
};

// Attach descriptions to words
WORDS_DATA.forEach(word => {
    word.description = PHILOSOPHICAL_DESCRIPTIONS[word.id] || "";
});

document.addEventListener('DOMContentLoaded', () => {
    const engine = new Engine();
    engine.init();
});