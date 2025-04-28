import { Word } from 'components/Word.js';
import { WORDS_DATA } from 'config/constants.js'; // Base word definitions
import { getRandomPosition } from 'utils/position.js'; // For initial placement

export class WordManager {
    constructor(engine) {
        this.engine = engine;
    }

    initializeWords(container) {
        if (!container) {
            console.error("Container not provided for word initialization!");
            return;
        }
        // Clear existing words if any (e.g., on game restart)
        // Use the destroy method which now handles animation/removal via renderer
        [...this.engine.gameState.words].forEach(word => word.destroy(true)); // Destroy immediately
        this.engine.gameState.words = [];
        container.innerHTML = ''; // Clear container visually

        // Create initial words
        WORDS_DATA.forEach(wordData => {
            this.createAndAddWord(wordData, container);
        });

         // Initialize base word stats *after* creating words
         if (this.engine.upgradeSystem) {
            this.engine.upgradeSystem.initializeWordBaseStats();
         }
    }

    createAndAddWord(wordData, container) {
        // Word constructor now handles internal component creation
        const word = new Word(wordData, container, this.engine);

        if (!word.element) {
            console.error(`Failed to create element for word ${wordData.id}. Aborting add.`);
            return null; // Return null if element creation failed
        }

        const initialPosition = getRandomPosition(word.element, container);
        word.x = initialPosition.x;
        word.y = initialPosition.y;

        // WordRenderer handles initial position update via transform
        word.renderer.updatePosition();

        this.engine.gameState.words.push(word);
        return word; // Return the created word instance
    }

    // Optional: Method to remove a word instance cleanly
    removeWord(wordInstance) {
        if (!wordInstance) return;
        wordInstance.destroy(); // Use the word's destroy method
        // The destroy method should handle removal from gameState.words array
    }
}