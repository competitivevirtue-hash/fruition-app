import { Activity, Brain, Zap, Heart, Shield } from 'lucide-react';

// Import all local fruit icons eagerly from the assets folder
const localIcons = import.meta.glob('../assets/*-icon.png', { eager: true, import: 'default' });

// --- INTELLIGENCE KNOWLEDGE BASE --- //
export const FRUIT_INTELLIGENCE = {
    // Colors: red, orange, yellow, green, blue, purple, white
    // Benefits: immunity, energy, brain, digestion, heart
    'apple': { color: 'red', benefits: ['heart', 'digestion'] },
    'banana': { color: 'yellow', benefits: ['energy', 'digestion'] },
    'orange': { color: 'orange', benefits: ['immunity'] },
    'blueberry': { color: 'blue', benefits: ['brain', 'heart'] },
    'blueberries': { color: 'blue', benefits: ['brain', 'heart'] },
    'strawberry': { color: 'red', benefits: ['immunity', 'heart'] },
    'strawberries': { color: 'red', benefits: ['immunity', 'heart'] },
    'grape': { color: 'purple', benefits: ['heart', 'brain'] },
    'grapes': { color: 'purple', benefits: ['heart', 'brain'] },
    'kiwi': { color: 'green', benefits: ['immunity', 'digestion'] },
    'pineapple': { color: 'yellow', benefits: ['immunity', 'digestion'] },
    'mango': { color: 'orange', benefits: ['immunity', 'eye_health'] },
    'watermelon': { color: 'red', benefits: ['hydration', 'heart'] },
    'lemon': { color: 'yellow', benefits: ['immunity'] },
    'lime': { color: 'green', benefits: ['immunity'] },
    'pear': { color: 'green', benefits: ['digestion', 'heart'] },
    'peach': { color: 'orange', benefits: ['digestion', 'immunity'] },
    'cherry': { color: 'red', benefits: ['recovery', 'sleep'] },
    'avocado': { color: 'green', benefits: ['heart', 'brain'] },
};

export const COLOR_MAP = {
    red: { label: 'Red', hex: '#FF4D4D' },
    orange: { label: 'Orange', hex: '#FF8C00' },
    yellow: { label: 'Yellow', hex: '#FDB813' },
    green: { label: 'Green', hex: '#4CAF50' },
    blue: { label: 'Blue', hex: '#2196F3' },
    purple: { label: 'Purple', hex: '#9C27B0' },
};

export const BENEFIT_MAP = {
    immunity: { label: 'Immunity', icon: Shield, color: '#4CAF50' },
    energy: { label: 'Energy', icon: Zap, color: '#FDB813' },
    brain: { label: 'Brain', icon: Brain, color: '#9C27B0' },
    heart: { label: 'Heart', icon: Heart, color: '#FF4D4D' },
    digestion: { label: 'Digestion', icon: Activity, color: '#2196F3' },
};

// --- DEFINITIONS (Collins Dictionary Style + Biological Context) --- //
export const COLOR_DEFINITIONS = {
    red: "Of a color at the end of the spectrum next to orange; in nature, often signaling the presence of lycopene or anthocyanins, typically associated with heart health and cellular protection.",
    orange: "A reddish-yellow colour; biologically indicative of high beta-carotene and vitamin C content, essential for immune competence and ocular health.",
    yellow: "Of the colour of gold, butter, or a lemon; often denoting fruits rich in flavonoids and potassium, contributing to energy metabolism and enzymatic function.",
    green: "Of the colour between blue and yellow in the spectrum; coloured like grass; typically rich in chlorophyll, isothiocyanates, and vitamin K, vital for detoxification and arterial health.",
    blue: "Affected with or having the colour of the sky or the sea; indicating a high concentration of powerful antioxidants known as anthocyanins, crucial for cognitive function and memory.",
    purple: "Of a colour intermediate between red and blue; indicating a high concentration of powerful antioxidants known as anthocyanins, crucial for cognitive function and memory."
};

export const BADGES = [
    { id: 'eco', name: 'Eco Warrior', desc: '> 90% efficiency', icon: '🌍', color: '#10b981', condition: (p) => p.efficiency > 90 && p.totalProcessed > 10 },
    { id: 'ninja', name: 'Fruit Ninja', desc: '50+ fruits eaten', icon: '🥷', color: '#f59e0b', condition: (p) => p.totalConsumed >= 50 },
    { id: 'starter', name: 'Fresh Start', desc: 'First fruit logged', icon: '🌱', color: '#3b82f6', condition: (p) => p.totalConsumed > 0 },
    { id: 'master', name: 'Zen Master', desc: 'Zero waste for 7 days', icon: '🧘', color: '#8b5cf6', condition: () => false }
];

export const getFruitImage = (fruitName) => {
    if (!fruitName) return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=500';

    // 1. Special case for Apples: Map all varieties to the generic apple icon
    if (fruitName.toLowerCase().includes('apple')) {
        return localIcons['../assets/apple-icon.png'] || localIcons['../assets/fuji-apple-icon.png']; // Fallback if apple-icon missing, though it should exist
    }

    // 2. Convert to slug (e.g. "Granny Smith Apple" -> "granny-smith-apple")
    const slug = fruitName.toLowerCase().trim().replace(/\s+/g, '-');

    // 2. Check for local icon
    // The keys in localIcons are relative to this file
    const localPath = `../assets/${slug}-icon.png`;
    if (localIcons[localPath]) {
        return localIcons[localPath];
    }

    // 3. Fallback to existing Unsplash map (for fruits without local icons)
    const name = fruitName.toLowerCase().trim();
    const fruitImages = {
        'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=500',
        'apricot': 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&q=80&w=500',
        'avocado': 'https://images.unsplash.com/photo-1523049673856-3eb43db958cd?auto=format&fit=crop&q=80&w=500',
        'banana': 'https://images.unsplash.com/photo-1571771896612-61013655ca77?auto=format&fit=crop&q=80&w=500',
        'blackberry': 'https://images.unsplash.com/photo-1615485925763-8678628890a5?auto=format&fit=crop&q=80&w=500',
        'blueberry': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=500',
        'blueberries': 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&q=80&w=500',
        'cantaloupe': 'https://images.unsplash.com/photo-1596706972230-67c293796590?auto=format&fit=crop&q=80&w=500',
        'cherry': 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&q=80&w=500',
        'cherries': 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&q=80&w=500',
        'coconut': 'https://images.unsplash.com/photo-1615485025753-41c195baee0e?auto=format&fit=crop&q=80&w=500',
        'cranberry': 'https://images.unsplash.com/photo-1615485290333-e1878d672223?auto=format&fit=crop&q=80&w=500',
        'date': 'https://images.unsplash.com/photo-1549411986-e3d8206d4452?auto=format&fit=crop&q=80&w=500',
        'dragon fruit': 'https://images.unsplash.com/photo-1527357494441-26ec00220677?auto=format&fit=crop&q=80&w=500',
        'durian': 'https://images.unsplash.com/photo-1576404285145-c3f25d97f394?auto=format&fit=crop&q=80&w=500',
        'fig': 'https://images.unsplash.com/photo-1601379563503-4682c3321591?auto=format&fit=crop&q=80&w=500',
        'grape': 'https://images.unsplash.com/photo-1537640538965-1756fb179c26?auto=format&fit=crop&q=80&w=500',
        'grapes': 'https://images.unsplash.com/photo-1537640538965-1756fb179c26?auto=format&fit=crop&q=80&w=500',
        'grapefruit': 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&q=80&w=500',
        'guava': 'https://images.unsplash.com/photo-1536511445517-567c9fe6fb83?auto=format&fit=crop&q=80&w=500',
        'honeydew': 'https://images.unsplash.com/photo-1596706972230-67c293796590?auto=format&fit=crop&q=80&w=500',
        'kiwi': 'https://images.unsplash.com/photo-1616684553557-82371dfba65f?auto=format&fit=crop&q=80&w=500',
        'lemon': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=500',
        'lime': 'https://images.unsplash.com/photo-1594488518026-148b859187e9?auto=format&fit=crop&q=80&w=500',
        'lychee': 'https://plus.unsplash.com/premium_photo-1675715923985-78096538676d?auto=format&fit=crop&q=80&w=500',
        'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=500',
        'melon': 'https://images.unsplash.com/photo-1598511726623-d0906313d5b5?auto=format&fit=crop&q=80&w=500',
        'nectarine': 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=500',
        'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=500',
        'papaya': 'https://images.unsplash.com/photo-1617117551093-66f81dfd7ef7?auto=format&fit=crop&q=80&w=500',
        'passion fruit': 'https://images.unsplash.com/photo-1588607684074-f81d871d8764?auto=format&fit=crop&q=80&w=500',
        'peach': 'https://images.unsplash.com/photo-1629747490241-624f07d7081c?auto=format&fit=crop&q=80&w=500',
        'pear': 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=500',
        'persimmon': 'https://images.unsplash.com/photo-1605307399899-7f315256e210?auto=format&fit=crop&q=80&w=500',
        'pineapple': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=500',
        'plum': 'https://images.unsplash.com/photo-1601878563363-22830f3a61dc?auto=format&fit=crop&q=80&w=500',
        'pomegranate': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=500',
        'raspberry': 'https://images.unsplash.com/photo-1577069861033-55d357917b6d?auto=format&fit=crop&q=80&w=500',
        'strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4b032?auto=format&fit=crop&q=80&w=500',
        'strawberries': 'https://images.unsplash.com/photo-1464965911861-746a04b4b032?auto=format&fit=crop&q=80&w=500',
        'tangerine': 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&q=80&w=500',
        'watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=500'
    };

    return fruitImages[name] || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=500';
};

// --- STANDARIZED DICTIONARY (The Source of Truth) ---
export const KNOWN_FRUIT_MAP = {
    'apple': 'Apple',
    'apples': 'Apple',
    'apricot': 'Apricot',
    'banana': 'Banana',
    'bananas': 'Banana',
    'blackberry': 'Blackberry',
    'blackberries': 'Blackberry',
    'blueberry': 'Blueberry',
    'blueberries': 'Blueberry',
    'cantaloupe': 'Cantaloupe',
    'cherry': 'Cherry',
    'cherries': 'Cherry',
    'cranberry': 'Cranberry',
    'dragon fruit': 'Dragon Fruit',
    'fig': 'Fig',
    'figs': 'Fig',
    'grape': 'Grape',
    'grapes': 'Grape',
    'grapefruit': 'Grapefruit',
    'kiwi': 'Kiwi',
    'kiwis': 'Kiwi',
    'lemon': 'Lemon',
    'lemons': 'Lemon',
    'lime': 'Lime',
    'limes': 'Lime',
    'lychee': 'Lychee',
    'mango': 'Mango',
    'mangos': 'Mango',
    'mangoes': 'Mango',
    'melon': 'Melon',
    'nectarine': 'Nectarine',
    'orange': 'Orange',
    'oranges': 'Orange',
    'papaya': 'Papaya',
    'passion fruit': 'Passion Fruit',
    'peach': 'Peach',
    'peaches': 'Peach',
    'pear': 'Pear',
    'pears': 'Pear',
    'pineapple': 'Pineapple',
    'pineapples': 'Pineapple',
    'plum': 'Plum',
    'pomegranate': 'Pomegranate',
    'raspberry': 'Raspberry',
    'raspberries': 'Raspberry',
    'strawberry': 'Strawberry',
    'strawberries': 'Strawberry',
    'tangerine': 'Tangerine',
    'watermelon': 'Watermelon'
};

export const normalizeFruitName = (name) => {
    if (!name) return 'Unknown';
    const lower = name.toLowerCase().trim();

    // 1. Check Dictionary first (handles plurals/typos mapped above)
    if (KNOWN_FRUIT_MAP[lower]) {
        return KNOWN_FRUIT_MAP[lower];
    }

    // 2. Fallback: Title Case for unknown items
    return lower.replace(
        /\w\S*/g,
        text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

// Deprecated: Alias to new function for backward compat
export const formatFruitName = normalizeFruitName;

// ---------------------------------------------------------
// INTELLIGENT SHELF LIFE DATABASE (Days)
// ---------------------------------------------------------
const SHELF_LIFE_DB = {
    'apple': 14,
    'apricot': 5,
    'avocado': 3,
    'banana': 5,
    'blackberry': 2,
    'blueberry': 5,
    'cantaloupe': 5,
    'cherry': 3,
    'coconut': 14,
    'cranberry': 14,
    'date': 30, // dried usually, or fresh long lasting
    'dragon fruit': 5,
    'durian': 5,
    'fig': 3,
    'grape': 7,
    'grapefruit': 14,
    'guava': 3,
    'honeydew': 5,
    'kiwi': 7,
    'lemon': 14,
    'lime': 14,
    'lychee': 3,
    'mango': 5,
    'melon': 5,
    'nectarine': 4,
    'orange': 14,
    'papaya': 4,
    'passion fruit': 7,
    'peach': 4,
    'pear': 5,
    'persimmon': 5,
    'pineapple': 3,
    'plum': 4,
    'pomegranate': 14,
    'raspberry': 2,
    'strawberry': 3,
    'tangerine': 14,
    'watermelon': 7
};

export const getShelfLife = (fruitName) => {
    if (!fruitName) return 7; // Default fallback
    const lowerName = fruitName.toLowerCase();

    // Exact or partial match
    // 1. Try exact key match (cleaned)
    for (const [key, days] of Object.entries(SHELF_LIFE_DB)) {
        if (lowerName.includes(key)) return days;
    }

    return 7; // Default if unknown
};

export const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    const daysDiff = Math.round((date - new Date()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff === -1) return 'Yesterday';
    return date.toLocaleDateString();
};

/**
 * Formats a date string according to user preferences.
 * @param {string|Date} dateInput - The date to format.
 * @param {object} settings - User settings { timeZone, hourCycle }.
 * @returns {string} Formatted date string (e.g. "Oct 24, 2:30 PM").
 */
export const formatUserDate = (dateInput, settings = {}) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Invalid Date';

    const timeZone = settings.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hourCycle = settings.hourCycle || 'h12'; // 'h11', 'h12', 'h23', 'h24'

    return new Intl.DateTimeFormat('default', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: timeZone,
        hourCycle: hourCycle
    }).format(date);
};
