import { Word } from 'components/Word.js';
import { WORDS_DATA } from 'config/constants.js';

// Accept engine instance as an argument
export function initGameScreen(engine) {
    const gameScreen = document.getElementById('game-screen'); // Get the game screen element
    const container = gameScreen.querySelector('.container'); // Find the container within the game screen
    const words = [];

    if (!container) {
        console.error("Container element not found in game screen!");
        return { words: [] };
    }

    if (!engine) {
        console.warn("Engine instance not provided to initGameScreen. Energy harvesting will not work.");
    }

    // Clear any potential placeholder content
    container.innerHTML = '';

    // Create word objects, passing the engine instance
    WORDS_DATA.forEach(wordData => {
        words.push(new Word(wordData, container, engine)); // Pass engine here
    });

    return { words };
}