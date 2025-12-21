import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = '0Cn8p19TOGv4cmnb0k2wXmPPDvFBsG6puZ7BKwCA';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// Extracted unique values from KNOWN_FRUIT_MAP
const FRUITS_TO_FETCH = [
    'Apple', 'Apricot', 'Banana', 'Blackberry', 'Blueberry',
    'Cantaloupe', 'Cherry', 'Cranberry', 'Dragon Fruit', 'Fig',
    'Grape', 'Grapefruit', 'Kiwi', 'Lemon', 'Lime', 'Lychee',
    'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya',
    'Passion Fruit', 'Peach', 'Pear', 'Pineapple', 'Plum',
    'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine', 'Watermelon'
];

const fetchFruitData = async (fruitName) => {
    try {
        console.log(`Fetching ${fruitName}...`);
        // 1. Search to get ID
        const searchUrl = `${BASE_URL}?api_key=${API_KEY}&query=${encodeURIComponent(fruitName + ' raw')}&dataType=Foundation,SR Legacy&pageSize=1`;
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) throw new Error(`Search HTTP ${searchRes.status}`);
        const searchData = await searchRes.json();

        if (!searchData.foods || searchData.foods.length === 0) return null;
        const searchResult = searchData.foods[0];
        const fdcId = searchResult.fdcId;

        // 2. Fetch Full Details
        console.log(`   -> Found ID ${fdcId}, fetching details...`);
        const detailsUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        if (!detailsRes.ok) throw new Error(`Details HTTP ${detailsRes.status}`);
        const food = await detailsRes.json();

        // Extracts
        const nutrients = food.foodNutrients;
        const getNutrientVal = (id) => {
            // Nutrient IDs might differ slightly between search and details, but usually consistent for these standard ones
            // In full details `nutrient` object has `nutrient` property? No, it's flat in `foodNutrients`.
            // Wait, for Foundation foods, `foodNutrients` might be structured differently?
            // Checking documentation: details endpoint returns `foodNutrients` array where each element has `nutrient` object containing `id`.
            // Actually, let's look at a sample response if I can... or just code defensively.
            // In "search" it's `nutrientId`. In "details" it's usually `nutrient.id`.
            const n = nutrients.find(item => (item.nutrient ? item.nutrient.id : item.nutrientId) === id);
            if (!n) return 'N/A';
            const amount = n.amount !== undefined ? n.amount : n.value;
            const unit = n.nutrient ? n.nutrient.unitName : n.unitName;
            return `${Math.round(amount)} ${unit.toLowerCase()}`;
        };

        const getRawNutrient = (id) => {
            const n = nutrients.find(item => (item.nutrient ? item.nutrient.id : item.nutrientId) === id);
            return n ? (n.amount !== undefined ? n.amount : n.value) : 0;
        };

        return {
            name: fruitName,
            calories: getNutrientVal(1008), // Energy
            vitaminC: getNutrientVal(1162), // Vitamin C
            potassium: getNutrientVal(1092), // Potassium
            fiber: getNutrientVal(1079),    // Fiber
            // Smart Portion Logic
            portions: food.foodPortions ? food.foodPortions.map(p => ({
                amount: p.amount,
                unit: p.measureUnit ? p.measureUnit.name : 'unit',
                modifier: p.modifier,
                gramWeight: p.gramWeight,
                description: `${p.amount} ${p.measureUnit ? p.measureUnit.name : ''} ${p.modifier ? `(${p.modifier})` : ''} - ${Math.round(p.gramWeight)}g`
            })).filter(p => p.gramWeight > 0) : [],
            // Raw values for calculation (per 100g)
            rawNutrients: {
                calories: getRawNutrient(1008),
                vitaminC: getRawNutrient(1162),
                potassium: getRawNutrient(1092),
                fiber: getRawNutrient(1079)
            }
        };
    } catch (error) {
        console.error(`Error fetching ${fruitName}:`, error.message);
        return null;
    }
};

const run = async () => {
    const results = {};

    // Serial execution to avoid rate limits (though public limit is high enough for 30 requests)
    for (const fruit of FRUITS_TO_FETCH) {
        const data = await fetchFruitData(fruit);
        if (data) {
            results[fruit.toLowerCase()] = data;
        }
        // Small delay just in case
        await new Promise(r => setTimeout(r, 500));
    }

    const outputPath = path.join(__dirname, '../src/data/fruitData.json');
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nSuccess! Wrote ${Object.keys(results).length} items to ${outputPath}`);
};

run();
