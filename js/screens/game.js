import { Word } from 'components/Word.js';
import { WORDS_DATA } from 'config/constants.js';

export function initGameScreen() {
    const gameScreen = document.getElementById('game-screen'); // Get the game screen element
    const container = gameScreen.querySelector('.container'); // Find the container within the game screen
    const words = [];

    if (!container) {
        console.error("Container element not found in game screen!");
        return { words: [] };
    }

    // Clear any potential placeholder content
    container.innerHTML = '';

    // Create word objects
    WORDS_DATA.forEach(wordData => {
        words.push(new Word(wordData, container));
    });

    return { words };
}