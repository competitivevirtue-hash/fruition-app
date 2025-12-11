// Simulated AI Service
// In a production environment, this would call Firebase Genkit or Gemini API.
// For now, it uses sophisticated heuristics to generate "Smart" recipes based on inventory.

const RECIPE_DATABASE = [
    {
        name: "Morning Sunshine Smoothie",
        ingredients: ["orange", "banana", "yogurt", "honey"],
        instructions: "Blend all ingredients until smooth. Top with a slice of orange.",
        benefits: "High Vitamin C for energy."
    },
    {
        name: "Berry Blast Bowl",
        ingredients: ["strawberry", "blueberry", "raspberry", "granola"],
        instructions: "Mash berries with a fork. Mix with yogurt or serve over oatmeal.",
        benefits: "Antioxidant rich for immunity."
    },
    {
        name: "Tropical Paradise Salad",
        ingredients: ["pineapple", "mango", "kiwi", "lime"],
        instructions: "Cube the fruits. Squeeze fresh lime juice over top. Toss gently.",
        benefits: "Hydrating and refreshing."
    },
    {
        name: "Classic Fruit Salad",
        ingredients: ["apple", "grape", "melon", "honey"],
        instructions: "Chop apples and melon. Mix with whole grapes. Drizzle with honey.",
        benefits: "Simple fiber boost."
    },
    {
        name: "Green Detox Juice",
        ingredients: ["apple", "cucumber", "lemon", "spinach"],
        instructions: "Juice all ingredients. Serve over ice.",
        benefits: "Cleansing and alkalizing."
    },
    {
        name: "Creamy Banana Oats",
        ingredients: ["banana", "oats", "milk", "cinnamon"],
        instructions: "Slice banana into hot oatmeal. Sprinkle with cinnamon.",
        benefits: "Sustained energy release."
    }
];

export const generateSmartRecipe = async (availableFruits) => {
    // Simulate network delay for "AI Thinking" effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!availableFruits || availableFruits.length === 0) {
        return {
            title: "Empty Basket Special",
            description: "It looks like your basket is empty! Time to visit the market.",
            ingredients: ["None"],
            steps: ["Buy some fruit!"],
            why: "I can't cook with thin air!"
        };
    }

    const availableNames = availableFruits.map(f => f.name.toLowerCase());

    // Score recipes based on available ingredients
    const scoredRecipes = RECIPE_DATABASE.map(recipe => {
        const matches = recipe.ingredients.filter(ing =>
            availableNames.some(av => av.includes(ing))
        );
        return {
            ...recipe,
            score: matches.length,
            missing: recipe.ingredients.filter(ing => !availableNames.some(av => av.includes(ing)))
        };
    }).sort((a, b) => b.score - a.score);

    const bestMatch = scoredRecipes[0];

    if (bestMatch.score > 0) {
        return {
            title: bestMatch.name,
            description: bestMatch.benefits,
            ingredients: bestMatch.ingredients, // In real AI, this would be dynamic
            steps: [bestMatch.instructions],
            matchCount: bestMatch.score,
            missingIngredients: bestMatch.missing
        };
    }

    // Fallback if no specific match
    const randomFruit = availableFruits[0];
    return {
        title: `Simple ${randomFruit.name} Snack`,
        description: `Enjoy your fresh ${randomFruit.name} at its peak.`,
        ingredients: [randomFruit.name],
        steps: [`Wash the ${randomFruit.name} thoroughly.`, "Slice and enjoy!"],
        matchCount: 1,
        missingIngredients: []
    };
};

// ---------------------------------------------------------
// AI Knowledge Base (Simulating trusted government/academic sources)
// ---------------------------------------------------------

const FRUIT_KNOWLEDGE_BASE = [
    {
        name: 'Apple',
        fact: "A medium apple contains about 4 grams of fiber, covering 14% of your daily value. The peel alone contains most of the fiber and antioxidants.",
        source: "Harvard T.H. Chan School of Public Health",
        category: "Nutrition"
    },
    {
        name: 'Banana',
        fact: "Bananas are known for potassium, but they also provide 33% of the Daily Value for Vitamin B6, which is crucial for brain health and metabolism.",
        source: "National Institutes of Health (NIH)",
        category: "Metabolism"
    },
    {
        name: 'Blueberry',
        fact: "Blueberries contain anthocyanins, powerful antioxidants that may reduce DNA damage and help protect against aging and cancer.",
        source: "American Journal of Clinical Nutrition",
        category: "Longevity"
    },
    {
        name: 'Orange',
        fact: "One medium orange provides more than 100% of the recommended daily intake of Vitamin C, primarily supporting immune defense and collagen production.",
        source: "USDA FoodData Central",
        category: "Immunity"
    },
    {
        name: 'Strawberry',
        fact: "Strawberries are unique because their seeds are on the outside. A single berry can have 200 seeds, and they are excellent sources of manganese.",
        source: "University of Illinois Extension",
        category: "Botany"
    },
    {
        name: 'Kiwi',
        fact: "Kiwifruit contains more Vitamin C per gram than oranges. It also contains actinidin, an enzyme that can help digest proteins.",
        source: "European Journal of Nutrition",
        category: "Digestion"
    },
    {
        name: 'Pineapple',
        fact: "Pineapple is the only known source of bromelain, an enzyme mixture that digests protein and has anti-inflammatory properties.",
        source: "National Center for Complementary and Integrative Health",
        category: "Wellness"
    },
    {
        name: 'Avocado',
        fact: "Unlike most fruits, avocados are rich in healthy monounsaturated fats. They contain more potassium than bananas.",
        source: "American Heart Association",
        category: "Heart Health"
    },
    {
        name: 'Watermelon',
        fact: "Watermelon is 92% water but also rich in lycopene, an antioxidant linked to heart health and reduced sun damage risks.",
        source: "Agricultural Research Service (USDA)",
        category: "Hydration"
    },
    {
        name: 'Grape',
        fact: "Grapes, especially red and purple ones, contain resveratrol, an antioxidant studied for its benefits to heart health and longevity.",
        source: "Linus Pauling Institute",
        category: "Longevity"
    }
];

export const getRandomFruitFact = async () => {
    // Simulate AI Search Delay (Searching trusted databases...)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const randomIndex = Math.floor(Math.random() * FRUIT_KNOWLEDGE_BASE.length);
    return FRUIT_KNOWLEDGE_BASE[randomIndex];
};

export const getSmartSearchFact = async (query) => {
    // Simulate AI Analysis
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();
    const match = FRUIT_KNOWLEDGE_BASE.find(f => f.name.toLowerCase().includes(lowerQuery));

    if (match) return match;

    // Fallback AI generation (Simulated generic trusted fact)
    return {
        name: query,
        fact: `${query} is a nutrient-dense food. Most fruits provide essential vitamins, minerals, and fiber which are vital for maintaining good health.`,
        source: "Dietary Guidelines for Americans (USDA)",
        category: "General Health"
    };
};
