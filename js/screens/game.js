import { Word } from 'components/Word.js';
import { WORDS_DATA } from 'config/constants.js';

export function initGameScreen() {
    const container = document.querySelector('.container');
    const words = [];
    
    // Create word objects
    WORDS_DATA.forEach(wordData => {
        words.push(new Word(wordData, container));
    });
    
    return { words };
}

