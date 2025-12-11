const API_KEY = '0Cn8p19TOGv4cmnb0k2wXmPPDvFBsG6puZ7BKwCA';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export const fetchFruitNutrition = async (fruitName) => {
    if (!fruitName) return null;

    try {
        const query = `${fruitName} raw`; // Append 'raw' for better matches
        const url = `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR Legacy&pageSize=1`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) {
            return null;
        }

        const food = data.foods[0];
        const nutrients = food.foodNutrients;

        // Helper to find nutrient value
        const getNutrientVal = (id) => {
            const nutrient = nutrients.find(n => n.nutrientId === id);
            return nutrient ? `${Math.round(nutrient.value)} ${nutrient.unitName.toLowerCase()}` : 'N/A';
        };

        return {
            calories: getNutrientVal(1008), // Energy
            vitaminC: getNutrientVal(1162), // Vitamin C
            fiber: getNutrientVal(1079)    // Fiber
        };

    } catch (error) {
        console.error("Error fetching USDA data:", error);
        return null;
    }
};

export const searchFruits = async (query) => {
    if (!query) return [];

    // Local guide for instant, intelligent results
    // This helps kids, bad spellers, and provides instant feedback for common items
    const commonFruits = [
        'Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry',
        'Cantaloupe', 'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragon Fruit',
        'Durian', 'Fig', 'Grape', 'Grapefruit', 'Guava', 'Honeydew', 'Kiwi',
        'Lemon', 'Lime', 'Lychee', 'Mango', 'Melon', 'Nectarine', 'Orange',
        'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Persimmon', 'Pineapple',
        'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine', 'Watermelon'
    ];

    const lowerQuery = query.toLowerCase();

    // 1. Check local list first (Priority to 'starts with')
    const localMatches = commonFruits.filter(fruit =>
        fruit.toLowerCase().startsWith(lowerQuery)
    ).map(name => ({ name, id: `local-${name}` })).slice(0, 5);

    // If we have good local matches (especially for short queries), return them immediately
    // This avoids API latency and strictness issues
    if (localMatches.length > 0) {
        return localMatches;
    }

    // 2. Fallback to USDA API for obscure items
    if (query.length < 3) return []; // Don't spam API with short queries if local failed

    try {
        // Fetch more initially (20) so we can filter down to 5 good ones
        const url = `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR Legacy&pageSize=20`;
        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();

        // Helper to title case
        const toTitleCase = (str) => {
            return str.replace(
                /\w\S*/g,
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            );
        };

        // Filter out non-fruit items
        const excludedTerms = ['babyfood', 'juice', 'sauce', 'pie', 'cake', 'cookie', 'strudel', 'canned', 'frozen', 'drink', 'yogurt', 'puree', 'soup', 'spread', 'jam', 'jelly', 'cobbler', 'crisp', 'syrup'];

        const filteredFoods = data.foods ? data.foods.filter(f => {
            const desc = f.description.toLowerCase();
            // Must not contain excluded terms
            const hasExcluded = excludedTerms.some(term => desc.includes(term));
            if (hasExcluded) return false;

            // Prefer items that have "raw" if possible, but don't strictly enforce it unless we have plenty of results.
            // For now, strict exclusion is the main goal.
            return true;
        }) : [];

        // Return top 5
        return filteredFoods.slice(0, 5).map(f => ({
            name: toTitleCase(f.description.replace(/, raw/i, '').replace(/, all types/i, '').replace(/, with skin/i, '')),
            id: f.fdcId
        }));
    } catch (error) {
        console.error("Error searching fruits:", error);
        return [];
    }
};
