// Station to category mapping
const STATION_CATEGORIES = {
  // Bruin Plate (BPlate)
  "Freshly Bowled": "Main Course",
  "Harvest": "Side",
  "Simply Grilled": "Main Course",
  "Soups": "Soup",
  "The Hearth": "Main Course",
  "The Garden": "Side",
  "The Oven": "Main Course",
  "The Wok": "Main Course", 
  "The Deli": "Side",
  "The Sweet Spot": "Dessert",
  "Beverage Station": "Beverage",
  "Greens 'N More": "Side",
  
  // De Neve Dining
  "The Front Burner": "Main Course",
  "The Grill": "Main Course",
  "The Pizzeria": "Main Course",
  "Harvest Kitchen": "Main Course",
  "Seasonal Sides": "Side",
  "Field Greens Bar": "Side",
  "Market Salads & Fruit": "Side",
  "The Sweet Stop": "Dessert",
  "Frozen Yogurt": "Dessert",
  "Late Night De Neve": "Main Course",
  "Yogurt Bar": "Dessert",
  
  // Epicuria at Covel
  "Capri": "Main Course",
  "Psistaria": "Main Course",
  "Mezze": "Side",
  "Alimenti": "Main Course",
  "Dolce": "Dessert",
  "Capri Pizza": "Main Course",
  
  // Generic categories
  "Bakery": "Dessert",
  "Pastries": "Dessert",
  "Sweets": "Dessert",
  "Pizza": "Main Course",
  "Grill": "Main Course",
  "Sandwiches": "Main Course",
  "Pasta": "Main Course",
  "Burgers": "Main Course",
  "Entrees": "Main Course",
  "Global Kitchen": "Main Course",
  "Taqueria": "Main Course",
  "Mediterranean": "Main Course",
  "Bruin Plate": "Main Course",
  "De Neve": "Main Course",
  "Epicuria": "Main Course",
  "FEAST at Rieber": "Main Course",
  "Salad Bar": "Side",
  "Fresh": "Side",
  "Vegetables": "Side",
  "Vegetarian": "Main Course",
  "Vegan": "Main Course",
  "Drinks": "Beverage",
  "Beverages": "Beverage",
  "Fruit": "Side",
  "Breakfast": "Main Course",
  "Cereal": "Side"
};

// Common allergens to detect in ingredients
const COMMON_ALLERGENS = {
  "peanut": ["peanut", "peanuts", "arachis"],
  "tree nut": ["almond", "almonds", "hazelnut", "hazelnuts", "walnut", "walnuts", "cashew", "cashews", "pistachio", "pistachios", "pecan", "pecans", "macadamia"],
  "dairy": ["milk", "cheese", "butter", "cream", "yogurt", "lactose", "dairy", "whey", "casein"],
  "egg": ["egg", "eggs", "yolk", "albumen"],
  "soy": ["soy", "soybeans", "soya", "edamame", "tofu"],
  "wheat": ["wheat", "gluten", "bread", "flour", "pasta", "cereal"],
  "fish": ["fish", "salmon", "tuna", "cod", "tilapia", "halibut", "anchovy", "anchovies"],
  "shellfish": ["shellfish", "shrimp", "crab", "lobster", "clam", "clams", "mussel", "mussels", "oyster", "oysters"],
  "sesame": ["sesame", "tahini"]
};

// Comprehensive lists for dietary restriction checking
const MEAT_KEYWORDS = [
  "meat", "beef", "chicken", "pork", "lamb", "turkey", "duck", "veal", "venison", 
  "bacon", "ham", "sausage", "salami", "pepperoni", "prosciutto", "jerky", "steak",
  "burger", "meatball", "meatloaf", "hot dog", "brisket", "ribs", "cured meat"
];

const FISH_KEYWORDS = [
  "fish", "salmon", "tuna", "cod", "tilapia", "halibut", "trout", "bass", "snapper", 
  "sardine", "anchovy", "mackerel", "herring", "swordfish", "haddock", "flounder", 
  "grouper", "mahi mahi", "perch", "catfish", "sea bass"
];

const SHELLFISH_KEYWORDS = [
  "shellfish", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", 
  "scallop", "abalone", "squid", "octopus", "calamari", "crayfish", "langoustine"
];

const ANIMAL_BYPRODUCTS_KEYWORDS = [
  "gelatin", "lard", "tallow", "suet", "rennet", "bone broth", "bone char",
  "animal shortening", "animal stock", "worcestershire sauce"
];

const DAIRY_KEYWORDS = [
  "milk", "cheese", "butter", "cream", "yogurt", "lactose", "dairy", "whey", 
  "casein", "ghee", "custard", "ice cream", "buttermilk", "curds", "pudding",
  "sour cream", "half and half", "creme fraiche", "kefir", "frosting", "creamer"
];

const EGG_KEYWORDS = [
  "egg", "eggs", "yolk", "albumen", "egg white", "mayonnaise", "meringue",
  "hollandaise", "aioli", "quiche", "frittata", "omelet", "custard"
];

const HONEY_KEYWORDS = ["honey", "honeycomb", "bee pollen"];

// Words that might indicate food types
const FOOD_TYPE_KEYWORDS = {
  "Dessert": ["cake", "cookie", "cupcake", "ice cream", "pudding", "pie", "sweet", "chocolate", "candy", "dessert"],
  "Soup": ["soup", "chowder", "broth", "bisque", "stew"],
  "Beverage": ["drink", "juice", "soda", "water", "coffee", "tea", "beverage", "smoothie", "latte", "cappuccino"],
  "Side": ["side", "fries", "chips", "rice", "vegetable", "salad", "potatoes", "beans"],
  "Main Course": ["chicken", "beef", "pork", "fish", "tofu", "burger", "sandwich", "pizza", "pasta", "wrap", "taco", "burrito", "bowl"]
};

/**
 * Calculates preference score for an item based on liked and disliked foods
 * @param {Object} item - Menu item with name, ingredients, and tags
 * @param {Array} likedFoods - Array of food preferences user likes
 * @param {Array} dislikedFoods - Array of food preferences user dislikes
 * @returns {number} Preference score (positive for liked, negative for disliked, 0 for neutral)
 */
function calculatePreferenceScore(item, likedFoods = [], dislikedFoods = []) {
    if (likedFoods.length === 0 && dislikedFoods.length === 0) {
        return 0; // No preferences specified
    }

    let preferenceScore = 0;
    const itemText = [
        item.name || '',
        ...(item.ingredients || []),
        ...(item.tags || [])
    ].join(' ').toLowerCase();

    // Calculate liked food matches (positive score)
    for (const likedFood of likedFoods) {
        const likedFoodLower = likedFood.toLowerCase().trim();
        if (likedFoodLower && itemText.includes(likedFoodLower)) {
            preferenceScore += 0.5; // Boost score for liked foods
        }
    }

    // Calculate disliked food matches (negative score)
    for (const dislikedFood of dislikedFoods) {
        const dislikedFoodLower = dislikedFood.toLowerCase().trim();
        if (dislikedFoodLower && itemText.includes(dislikedFoodLower)) {
            preferenceScore -= 0.3; // Reduce score for disliked foods
        }
    }

    return preferenceScore;
}

/**
 * Detects food category based on item name and station
 * @param {string} itemName - The name of the food item
 * @param {string} station - The station where the food is served
 * @returns {string} The detected food category
 */
function detectFoodCategory(itemName, station) {
  // Check if station directly maps to a category
  if (station && STATION_CATEGORIES[station]) {
    return STATION_CATEGORIES[station];
  }
  
  // Look for station name containing keywords
  for (const [stationKey, category] of Object.entries(STATION_CATEGORIES)) {
    if (station && station.toLowerCase().includes(stationKey.toLowerCase())) {
      return category;
    }
  }
  
  // Check item name for category keywords
  const lowerItemName = itemName.toLowerCase();
  for (const [category, keywords] of Object.entries(FOOD_TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerItemName.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  // Default to Main Course if nothing else matches
  return "Main Course";
}

/**
 * Detects allergens in ingredients list
 * @param {string[]} ingredients - List of ingredients
 * @returns {string[]} List of detected allergens
 */
function detectAllergens(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) {
    return [];
  }
  
  const detectedAllergens = new Set();
  const ingredientsText = ingredients.join(' ').toLowerCase();
  
  for (const [allergen, keywords] of Object.entries(COMMON_ALLERGENS)) {
    if (keywords.some(keyword => ingredientsText.includes(keyword.toLowerCase()))) {
      detectedAllergens.add(allergen);
    }
  }
  
  return [...detectedAllergens];
}

/**
 * Checks if an item contains any meat products based on a comprehensive keyword list
 * @param {string} ingredientsText - The combined ingredients text
 * @returns {boolean} True if meat is detected
 */
function containsMeat(ingredientsText) {
  return MEAT_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) ||
         FISH_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) ||
         SHELLFISH_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) ||
         ANIMAL_BYPRODUCTS_KEYWORDS.some(keyword => ingredientsText.includes(keyword));
}

/**
 * Checks if an item contains any animal products (for vegan determination)
 * @param {string} ingredientsText - The combined ingredients text
 * @returns {boolean} True if animal products are detected
 */
function containsAnimalProducts(ingredientsText) {
  return containsMeat(ingredientsText) ||
         DAIRY_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) ||
         EGG_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) ||
         HONEY_KEYWORDS.some(keyword => ingredientsText.includes(keyword));
}

/**
 * Enhances menu data with additional tags and categories
 * @param {Array} menuData - The original menu data
 * @returns {Array} Enhanced menu data with additional tags
 */
function enhanceMenuData(menuData) {
  return menuData.map(item => {
    // Convert Mongoose document to plain object
    const plainItem = item.toObject ? item.toObject() : item;
    
    // Make sure tags is an array
    const tags = Array.isArray(plainItem.tags) ? [...plainItem.tags] : [];
    
    // Add food category based on station and name
    const category = detectFoodCategory(plainItem.name, plainItem.station);
    if (!tags.includes(category)) {
      tags.push(category);
    }
    
    // Add allergen information as tags
    const allergens = detectAllergens(plainItem.ingredients);
    allergens.forEach(allergen => {
      if (!tags.includes(allergen)) {
        tags.push(allergen);
      }
    });
    
    // Initialize vegetarian/vegan status
    let isVegetarian = false;
    let isVegan = false;
    
    // Check existing tags first for explicit dietary information
    const hasVegetarianTag = tags.some(tag => 
      tag.toLowerCase().includes('vegetarian') || tag.toLowerCase().includes('veg'));
    const hasVeganTag = tags.some(tag => 
      tag.toLowerCase().includes('vegan') || tag.toLowerCase().includes('plant-based'));
    
    if (hasVeganTag) {
      isVegan = true;
      isVegetarian = true; // vegan implies vegetarian
      if (!tags.includes('vegan')) tags.push('vegan');
      if (!tags.includes('vegetarian')) tags.push('vegetarian');
    } else if (hasVegetarianTag) {
      isVegetarian = true;
      if (!tags.includes('vegetarian')) tags.push('vegetarian');
    }
    
    // If no explicit dietary tags and we have ingredients data, try to infer
    if (!isVegetarian && !isVegan && plainItem.ingredients && Array.isArray(plainItem.ingredients) && plainItem.ingredients.length > 0) {
      const ingredientsText = plainItem.ingredients.join(' ').toLowerCase();
      
      // Check if contains meat - if not, likely vegetarian
      if (!containsMeat(ingredientsText)) {
        isVegetarian = true;
        tags.push('vegetarian');
        
        // If it contains no animal products at all, it's vegan
        if (!containsAnimalProducts(ingredientsText)) {
          isVegan = true;
          tags.push('vegan');
        }
      }
    }
    
    // For items with missing or generic ingredients, make reasonable assumptions
    if (!isVegetarian && (!plainItem.ingredients || plainItem.ingredients.length === 0 || 
        plainItem.ingredients.some(ing => ing.toLowerCase().includes('custom recipe')))) {
      
      const itemName = plainItem.name.toLowerCase();
      
      // Check if name suggests it's vegetarian/vegan
      const vegKeywords = ['salad', 'vegetable', 'fruit', 'rice', 'pasta', 'bread', 'soup'];
      const veganKeywords = ['vegetable', 'fruit', 'rice', 'beans', 'quinoa'];
      const meatKeywords = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'meat', 'bacon', 'ham'];
      
      const likelyMeat = meatKeywords.some(keyword => itemName.includes(keyword));
      const likelyVeg = vegKeywords.some(keyword => itemName.includes(keyword));
      const likelyVegan = veganKeywords.some(keyword => itemName.includes(keyword));
      
      if (!likelyMeat) {
        if (likelyVegan) {
          isVegan = true;
          isVegetarian = true;
          tags.push('vegan', 'vegetarian');
        } else if (likelyVeg) {
          isVegetarian = true;
          tags.push('vegetarian');
        } else {
          // Default to vegetarian for ambiguous items to be inclusive
          isVegetarian = true;
          tags.push('vegetarian');
        }
      }
    }
    
    return {
      ...plainItem,
      tags,
      category,
      isVegetarian,
      isVegan
    };
  });
}

/**
 * Determines the variation strategy based on regeneration type and seed
 * @param {string} regenerationType - The type of regeneration ('default', 'regenerate')
 * @param {number|null} variationSeed - Optional seed for variation
 * @returns {object} Variation strategy configuration
 */
function getVariationStrategy(regenerationType, variationSeed) {
    if (regenerationType === 'default' || !variationSeed) {
        return {
            name: 'balanced',
            proteinWeight: 0.6,
            sugarPenalty: 0.25,
            fatPenalty: 0.15,
            sortingMethod: 'score'
        };
    }

    // Use seed to determine variation strategy
    const strategies = [
        {
            name: 'protein-focused',
            proteinWeight: 0.8,
            sugarPenalty: 0.15,
            fatPenalty: 0.05,
            sortingMethod: 'protein'
        },
        {
            name: 'low-sugar',
            proteinWeight: 0.4,
            sugarPenalty: 0.45,
            fatPenalty: 0.15,
            sortingMethod: 'sugar'
        },
        {
            name: 'low-fat',
            proteinWeight: 0.5,
            sugarPenalty: 0.2,
            fatPenalty: 0.3,
            sortingMethod: 'fat'
        },
        {
            name: 'calorie-efficient',
            proteinWeight: 0.3,
            sugarPenalty: 0.2,
            fatPenalty: 0.1,
            sortingMethod: 'calories'
        },
        {
            name: 'variety-focused',
            proteinWeight: 0.5,
            sugarPenalty: 0.2,
            fatPenalty: 0.15,
            sortingMethod: 'category'
        }
    ];

    const strategyIndex = variationSeed % strategies.length;
    return strategies[strategyIndex];
}

/**
 * Calculates nutrition score based on variation strategy
 * @param {number} calories - Item calories
 * @param {number} protein - Item protein
 * @param {number} sugar - Item sugar
 * @param {number} fat - Item fat
 * @param {object} strategy - Variation strategy
 * @returns {number} Calculated score
 */
function calculateVariationScore(calories, protein, sugar, fat, strategy) {
    if (calories <= 0) return 0;
    
    const proteinScore = (protein / calories) * strategy.proteinWeight;
    const sugarPenalty = (sugar / calories) * strategy.sugarPenalty;
    const fatPenalty = (fat / calories) * strategy.fatPenalty;
    
    return proteinScore - sugarPenalty - fatPenalty;
}

/**
 * Applies different sorting strategies based on variation
 * @param {Array} items - Scored menu items
 * @param {object} strategy - Variation strategy
 * @returns {Array} Sorted items
 */
function applySortingVariation(items, strategy) {
    let sortedItems = [...items];

    switch (strategy.sortingMethod) {
        case 'protein':
            sortedItems.sort((a, b) => {
                const proteinA = a.nutrition?.protein || 0;
                const proteinB = b.nutrition?.protein || 0;
                // First sort by preference, then by protein
                if (a.preferenceScore !== b.preferenceScore) {
                    return b.preferenceScore - a.preferenceScore;
                }
                return proteinB - proteinA;
            });
            break;
        
        case 'sugar':
            sortedItems.sort((a, b) => {
                const sugarA = a.nutrition?.sugar || 0;
                const sugarB = b.nutrition?.sugar || 0;
                // First sort by preference, then by sugar (lower first)
                if (a.preferenceScore !== b.preferenceScore) {
                    return b.preferenceScore - a.preferenceScore;
                }
                return sugarA - sugarB; // Lower sugar first
            });
            break;
        
        case 'fat':
            sortedItems.sort((a, b) => {
                const fatA = a.nutrition?.fat || 0;
                const fatB = b.nutrition?.fat || 0;
                // First sort by preference, then by fat (lower first)
                if (a.preferenceScore !== b.preferenceScore) {
                    return b.preferenceScore - a.preferenceScore;
                }
                return fatA - fatB; // Lower fat first
            });
            break;
        
        case 'calories':
            sortedItems.sort((a, b) => {
                // First sort by preference, then by calories (lower first)
                if (a.preferenceScore !== b.preferenceScore) {
                    return b.preferenceScore - a.preferenceScore;
                }
                return a.calculatedCalories - b.calculatedCalories; // Lower calories first
            });
            break;
        
        case 'category':
            // Sort by category diversity, then by preference, then by score
            const categoryPriority = { 'Main Course': 1, 'Side': 2, 'Soup': 3, 'Dessert': 4, 'Beverage': 5 };
            sortedItems.sort((a, b) => {
                const categoryA = a.category || detectFoodCategory(a.name, a.station);
                const categoryB = b.category || detectFoodCategory(b.name, b.station);
                const priorityA = categoryPriority[categoryA] || 6;
                const priorityB = categoryPriority[categoryB] || 6;
                
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                // Then by preference score
                if (a.preferenceScore !== b.preferenceScore) {
                    return b.preferenceScore - a.preferenceScore;
                }
                return b.score - a.score; // Then by nutritional score
            });
            break;
        
        default: // 'score'
            sortedItems.sort((a, b) => {
                // Combine nutritional score with preference score
                const totalScoreA = a.score + a.preferenceScore;
                const totalScoreB = b.score + b.preferenceScore;
                return totalScoreB - totalScoreA;
            });
            break;
    }

    return sortedItems;
}

/**
 * Generates a meal plan based on user preferences and available menu data
 * @param {Object} userPreferences - User's dietary preferences and restrictions
 * @param {Array} menuData - Available menu items
 * @returns {Object} Generated meal plan with selected items and nutritional totals
 */
export function generateMealPlan(userPreferences, menuData) {
    const {
        targetCalories,
        minProtein,
        maxSugar,
        maxFat,
        vegetarian,
        vegan,
        allowedTags = [],
        disallowedTags = [],
        allergens = [],
        excludedCategories = [],
        diningHall,
        mealTime,
        variationSeed = null,
        regenerationType = 'default',
        likedFoods = [],
        dislikedFoods = []
    } = userPreferences;

    // Enhance the menu data with additional tags and categories
    const enhancedMenuData = enhanceMenuData(menuData);

    const MAX_SERVINGS = 2;
    const CATEGORY_LIMIT = {
        "Dessert": 1,
        "Main Course": 3,
        "Side": 2,
        "Soup": 1,
        "Beverage": 1
    };

    // Filter menu items based on user preferences
    const filteredMenu = enhancedMenuData.filter(item => {
        // Check dietary restrictions - if user wants vegetarian/vegan, check if item qualifies
        const passesVegetarianCheck = !vegetarian || item.isVegetarian;
        const passesVeganCheck = !vegan || item.isVegan;
        
        // Check location and meal time - handle both old and new model structures
        const matchesLocation = !diningHall || 
                               item.dining_hall === diningHall || 
                               item.location === diningHall;
        const matchesTime = !mealTime || 
                           item.meal_period === mealTime || 
                           item.mealTime === mealTime;
        
        // Check allowed and disallowed tags
        const hasAllowedTags = allowedTags.length === 0 || 
                              allowedTags.some(tag => item.tags.some(itemTag => 
                                itemTag.toLowerCase().includes(tag.toLowerCase())));
                                
        const hasNoDisallowedTags = !disallowedTags.some(tag => item.tags.some(itemTag => 
            itemTag.toLowerCase().includes(tag.toLowerCase())));
        
        // Check allergens - if user specifies allergens to avoid, exclude items with those allergens
        const hasNoAllergens = allergens.length === 0 || 
                              !allergens.some(allergen => {
                                  // Check both allergens array and tags for allergen info
                                  const inAllergensList = item.allergens && item.allergens.some(itemAllergen => 
                                      itemAllergen.toLowerCase().includes(allergen.toLowerCase()));
                                  const inTags = item.tags.some(tag => 
                                      tag.toLowerCase().includes(allergen.toLowerCase()));
                                  return inAllergensList || inTags;
                              });
        
        // Check category exclusions - if user wants to exclude certain categories
        const itemCategory = item.category || detectFoodCategory(item.name, item.station);
        const notExcludedCategory = excludedCategories.length === 0 || 
                                  !excludedCategories.includes(itemCategory);
        
        const passes = passesVegetarianCheck && passesVeganCheck && matchesLocation && matchesTime && 
               hasAllowedTags && hasNoDisallowedTags && hasNoAllergens && notExcludedCategory;
        
        return passes;
    });

    // If no items match the filter criteria, return error with debug info
    if (filteredMenu.length === 0) {
        return {
            success: false,
            message: "No items match your dietary preferences. Try adjusting your filters.",
            selectedItems: [],
            totals: { calories: 0, protein: 0, sugar: 0, fat: 0 },
            debug: {
                totalItems: enhancedMenuData.length,
                preferences: userPreferences,
                sampleItem: enhancedMenuData[0] ? {
                    name: enhancedMenuData[0].name,
                    dining_hall: enhancedMenuData[0].dining_hall,
                    meal_period: enhancedMenuData[0].meal_period,
                    isVegetarian: enhancedMenuData[0].isVegetarian,
                    tags: enhancedMenuData[0].tags
                } : null
            }
        };
    }

    // Apply variation strategy based on regenerationType and variationSeed
    const variationStrategy = getVariationStrategy(regenerationType, variationSeed);

    // Score menu items based on nutritional value and estimated calories with variation
    const scored = filteredMenu.map(item => {
        // Use existing calories if available, otherwise estimate from macros
        let calories = item.calories || item.calculatedCalories;
        if (!calories || calories === 0) {
            // Estimate calories based on typical values for food items
            const protein = item.nutrition?.protein || 0;
            const fat = item.nutrition?.fat || 0;
            const carbs = item.nutrition?.carbs || 0;
            
            if (protein + fat + carbs > 0) {
                calories = (protein * 4) + (fat * 9) + (carbs * 4);
            } else {
                // Fallback: estimate based on food category and name
                const category = item.category || detectFoodCategory(item.name, item.station);
                if (category === "Dessert") calories = 250;
                else if (category === "Main Course") calories = 350;
                else if (category === "Side") calories = 150;
                else if (category === "Soup") calories = 100;
                else if (category === "Beverage") calories = 50;
                else calories = 200; // default
            }
        }
        
        const protein = item.nutrition?.protein || 0;
        const sugar = item.nutrition?.sugar || 0;
        const fat = item.nutrition?.fat || 0;
        
        // Calculate nutrition score with variation strategy
        const score = calculateVariationScore(
            calories, protein, sugar, fat, variationStrategy
        );
        
        // Calculate preference score for the item
        const preferenceScore = calculatePreferenceScore(item, likedFoods, dislikedFoods);
        
        return { ...item, score, calculatedCalories: calories, preferenceScore };
    });

    // Apply different sorting strategies based on variation
    const sortedItems = applySortingVariation(scored, variationStrategy);

    const selectedItems = [];
    const totals = {
        calories: 0,
        protein: 0,
        sugar: 0,
        fat: 0
    };

    const categoryCount = {};
    const itemCount = {};
    const usedItems = new Set();
    const warnings = [];

    // First pass: Select highest scoring items until we reach nutritional targets
    for (const item of sortedItems) {
        let servings = 0;
        const category = item.category || detectFoodCategory(item.name, item.station);
        
        const calories = item.calculatedCalories;
        const protein = item.nutrition?.protein || 0;
        const sugar = item.nutrition?.sugar || 0;
        const fat = item.nutrition?.fat || 0;
        
        // Skip if we've reached the category limit
        if (CATEGORY_LIMIT[category] && (categoryCount[category] || 0) >= CATEGORY_LIMIT[category]) {
            continue;
        }

        // Add servings until we reach limits
        while (
            servings < MAX_SERVINGS &&
            totals.calories + calories <= targetCalories * 1.05 &&
            totals.protein + protein <= minProtein * 2
        ) {
            // Stop if adding this would exceed sugar or fat limits
            if (
                (maxSugar && totals.sugar + sugar > maxSugar) ||
                (maxFat && totals.fat + fat > maxFat)
            ) break;

            servings++;
            totals.calories += calories;
            totals.protein += protein;
            totals.sugar += sugar;
            totals.fat += fat;
        }

        if (servings > 0) {
            // Track item and category counts
            itemCount[item.name] = servings;
            categoryCount[category] = (categoryCount[category] || 0) + servings;
            usedItems.add(item.name);
            
            // Add to selected items with details
            selectedItems.push({
                name: item.name,
                servings: servings,
                calories: calories * servings,
                protein: protein * servings,
                sugar: sugar * servings,
                fat: fat * servings,
                category: category,
                dining_hall: item.dining_hall,
                station: item.station,
                preferenceScore: item.preferenceScore
            });
        }

        // If we've reached our targets, stop adding items
        if (totals.calories >= targetCalories * 0.95 && totals.protein >= minProtein) break;
    }

    // Second pass: If we haven't reached calorie goal, add more items
    if (totals.calories < targetCalories * 0.95) {
        // Filter items we haven't fully used yet
        const remainingItems = sortedItems.filter(item => 
            (!usedItems.has(item.name) || (itemCount[item.name] || 0) < MAX_SERVINGS)
        );

        for (const item of remainingItems) {
            const category = item.category || detectFoodCategory(item.name, item.station);
            
            const calories = item.calculatedCalories;
            const protein = item.nutrition?.protein || 0;
            const sugar = item.nutrition?.sugar || 0;
            const fat = item.nutrition?.fat || 0;
            
            // Skip if we've reached the category limit
            if (CATEGORY_LIMIT[category] && (categoryCount[category] || 0) >= CATEGORY_LIMIT[category]) {
                continue;
            }
            
            let servings = 0;
            const maxAdditionalServings = MAX_SERVINGS - (itemCount[item.name] || 0);
            
            // Add servings until we reach limits
            while (
                servings < maxAdditionalServings &&
                totals.calories + calories <= targetCalories * 1.05
            ) {
                // Allow slight exceeding of sugar/fat if needed to reach calorie goal
                if (
                    (maxSugar && totals.sugar + sugar > maxSugar * 1.1) ||
                    (maxFat && totals.fat + fat > maxFat * 1.1)
                ) break;

                servings++;
                totals.calories += calories;
                totals.protein += protein;
                totals.sugar += sugar;
                totals.fat += fat;
            }

            if (servings > 0) {
                // Update item and category counts
                const previousServings = itemCount[item.name] || 0;
                itemCount[item.name] = previousServings + servings;
                categoryCount[category] = (categoryCount[category] || 0) + servings;
                
                // Find existing item or add new one
                const existingItemIndex = selectedItems.findIndex(si => si.name === item.name);
                if (existingItemIndex >= 0) {
                    selectedItems[existingItemIndex].servings += servings;
                    selectedItems[existingItemIndex].calories += calories * servings;
                    selectedItems[existingItemIndex].protein += protein * servings;
                    selectedItems[existingItemIndex].sugar += sugar * servings;
                    selectedItems[existingItemIndex].fat += fat * servings;
                } else {
                    selectedItems.push({
                        name: item.name,
                        servings: servings,
                        calories: calories * servings,
                        protein: protein * servings,
                        sugar: sugar * servings,
                        fat: fat * servings,
                        category: category,
                        dining_hall: item.dining_hall,
                        station: item.station,
                        preferenceScore: item.preferenceScore
                    });
                }
            }

            // If we've reached our calorie target, stop
            if (totals.calories >= targetCalories * 0.95) break;
        }
    }

    // Generate warnings if targets aren't met
    if (totals.calories < targetCalories * 0.8) {
        warnings.push(`Could not reach target calories (${Math.round(totals.calories)} vs ${Math.round(targetCalories)}). Consider increasing meal variety or reducing restrictions.`);
    }
    if (totals.protein < minProtein * 0.8) {
        warnings.push(`Could not reach minimum protein target (${Math.round(totals.protein)}g vs ${Math.round(minProtein)}g). Consider adding more protein-rich foods.`);
    }
    if (maxSugar && totals.sugar > maxSugar) {
        warnings.push(`Sugar content exceeds limit (${Math.round(totals.sugar)}g vs ${Math.round(maxSugar)}g max).`);
    }
    if (maxFat && totals.fat > maxFat) {
        warnings.push(`Fat content exceeds limit (${Math.round(totals.fat)}g vs ${Math.round(maxFat)}g max).`);
    }

    // Round totals for cleaner display
    Object.keys(totals).forEach(key => {
        totals[key] = Math.round(totals[key]);
    });

    // Group items by category for better organization
    const itemsByCategory = selectedItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    let message = "Meal plan generated successfully!";
    if (warnings.length > 0) {
        message = "Meal plan generated with some limitations. See warnings below.";
    }

    // Add variation info to response
    const result = {
        success: true,
        message,
        selectedItems,
        itemsByCategory,
        totals,
        warnings,
        variationInfo: {
            strategy: variationStrategy.name,
            seed: variationSeed,
            regenerationType
        }
    };

    return result;
}