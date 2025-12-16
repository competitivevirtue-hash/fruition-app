/**
 * smartParser.js
 * 
 * Parses natural language input to extract "Intent" for adding items to inventory.
 * Example Input: "I bought 3 apples, a bag of oranges, and some milk"
 * Output: [
 *   { name: 'Apple', quantity: 3, unit: 'Pieces' },
 *   { name: 'Orange', quantity: 1, unit: 'Bags' },
 *   { name: 'Milk', quantity: 1, unit: 'Pieces' }
 * ]
 */

import { normalizeFruitName } from './fruitUtils';
import { translations } from './translations'; // Optional: for multi-language support later

// Common units to look for
const UNITS = {
    'bag': 'Bags', 'bags': 'Bags',
    'box': 'Boxes', 'boxes': 'Boxes',
    'carton': 'Cartons', 'cartons': 'Cartons',
    'lb': 'lbs', 'lbs': 'lbs',
    'pound': 'lbs', 'pounds': 'lbs',
    'kg': 'kg', 'kilo': 'kg', 'kilos': 'kg',
    'bunch': 'Bunches', 'bunches': 'Bunches',
    'piece': 'Pieces', 'pieces': 'Pieces'
};

// Number words to digits
const NUMBER_WORDS = {
    'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'some': 1, 'few': 3 // Heuristic defaults
};

export const parseNaturalLanguageInput = (input) => {
    if (!input || typeof input !== 'string') return [];

    const normalizedInput = input.toLowerCase()
        .replace(/[,.]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ')  // Normalize spaces
        .replace(/\band\b/g, ' '); // Remove 'and'

    // Split by common delimiters (though we removed punctuation, sometimes logic helps)
    // We will use a regex to find "Quantity + Unit (Optional) + Item Name" patterns

    // Strategy: Split into chunks based on known items or assume comma separation if it existed?
    // Since we removed commas, let's try to match patterns iteratively.

    // 1. Tokenize roughly by potential items
    // "3 apples a bag of oranges" -> [ "3 apples", "a bag of oranges" ]
    // This is hard without knowing ALL valid fruit names, but we can try to match segments.
    // Better approach: Look for Number patterns and assume everything until the next Number is the Item.

    const items = [];
    const tokens = normalizedInput.trim().split(' ');

    let currentItem = { quantity: 1, unit: 'Pieces', nameWords: [] };
    let buffer = [];

    const flushBuffer = () => {
        if (buffer.length > 0) {
            // Process the buffer to find Unit and Name
            let nameStart = 0;

            // Check first word for Unit
            const potentialUnit = buffer[0];
            if (UNITS[potentialUnit]) {
                currentItem.unit = UNITS[potentialUnit];
                nameStart = 1;
                // Skip "of" if present (e.g. "bag OF apples")
                if (buffer[1] === 'of') nameStart = 2;
            }

            const nameStr = buffer.slice(nameStart).join(' ');
            if (nameStr) {
                // Normalize name (captilalize, singularize via utils if possible)
                currentItem.name = normalizeName(nameStr);
                items.push({ ...currentItem });
            }
        }
        // Reset
        currentItem = { quantity: 1, unit: 'Pieces', nameWords: [] };
        buffer = [];
    };

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Is it a number?
        let qty = parseInt(token);
        if (!isNaN(qty)) {
            flushBuffer();
            currentItem.quantity = qty;
            continue;
        }

        // Is it a number word?
        if (NUMBER_WORDS[token] !== undefined) {
            flushBuffer();
            currentItem.quantity = NUMBER_WORDS[token];
            continue;
        }

        // Ignore filler words at start of sentence if no quantity found yet
        if (buffer.length === 0 && ['i', 'went', 'to', 'the', 'store', 'bought', 'got', 'have', 'need'].includes(token)) {
            continue;
        }

        buffer.push(token);
    }

    flushBuffer(); // Flush remainder

    return items;
};

// Helper: Attempt to clean up the name
const normalizeName = (rawName) => {
    // Basic singularization heuristic (remove trailing 's' unless 'ss')
    let name = rawName.trim();

    // Remove trailing 's' if >3 chars and not ending in 'ss'/ 'us'
    // This is very rough, reliant on user verification in Modal
    if (name.length > 3 && name.endsWith('s') && !name.endsWith('ss') && !name.endsWith('us')) {
        name = name.slice(0, -1);
    }

    // Capitalize Words
    return name.replace(/\b\w/g, c => c.toUpperCase());
};
