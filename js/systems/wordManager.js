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
        this.engine.gameState.words.forEach(word => word.destroy()); // Add destroy method to Word class if needed
        this.engine.gameState.words = [];
        container.innerHTML = ''; // Clear container visually

        // Create initial words
        WORDS_DATA.forEach(wordData => {
            this.createAndAddWord(wordData, container);
        });
    }

    createAndAddWord(wordData, container) {
        const word = new Word(wordData, container, this.engine);
        const initialPosition = getRandomPosition(word.element, container);
        word.x = initialPosition.x;
        word.y = initialPosition.y;
        word.updateElementPosition();
        this.engine.gameState.words.push(word);
    }
}