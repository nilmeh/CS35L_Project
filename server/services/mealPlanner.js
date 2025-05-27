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
    // Make sure tags is an array
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
    
    // Add food category based on station and name
    const category = detectFoodCategory(item.name, item.station);
    if (!tags.includes(category)) {
      tags.push(category);
    }
    
    // Add allergen information as tags
    const allergens = detectAllergens(item.ingredients);
    allergens.forEach(allergen => {
      if (!tags.includes(allergen)) {
        tags.push(allergen);
      }
    });
    
    // Only attempt to add vegetarian/vegan tags if we have ingredients data
    // AND the existing tags don't already specify dietary restrictions
    if (item.ingredients && Array.isArray(item.ingredients) && item.ingredients.length > 0) {
      const ingredientsText = item.ingredients.join(' ').toLowerCase();
      
      // Check for existing dietary tags
      const hasVegetarianTag = tags.some(tag => 
        tag.toLowerCase() === 'vegetarian' || tag.toLowerCase() === 'veg');
      const hasVeganTag = tags.some(tag => 
        tag.toLowerCase() === 'vegan' || tag.toLowerCase() === 'plant-based');
      const hasNonVegTag = tags.some(tag => 
        tag.toLowerCase() === 'meat' || tag.toLowerCase() === 'contains meat');
      
      // Only try to infer vegetarian status if no conflicting tags exist
      if (!hasVegetarianTag && !hasVeganTag && !hasNonVegTag) {
        // Use comprehensive checks for meat products
        if (!containsMeat(ingredientsText)) {
          tags.push('vegetarian');
          
          // If it's vegetarian and contains no animal products at all, it's vegan
          if (!containsAnimalProducts(ingredientsText)) {
            tags.push('vegan');
          }
        }
      } 
      // If it's already tagged as vegetarian but not vegan, check for vegan status
      else if (hasVegetarianTag && !hasVeganTag) {
        // Check for dairy, eggs, honey
        if (!DAIRY_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) &&
            !EGG_KEYWORDS.some(keyword => ingredientsText.includes(keyword)) &&
            !HONEY_KEYWORDS.some(keyword => ingredientsText.includes(keyword))) {
          tags.push('vegan');
        }
      }
    }
    
    return {
      ...item,
      tags,
      category
    };
  });
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
        diningHall,
        mealTime
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
        // Check dietary restrictions
        const isVeg = !vegetarian || item.tags.some(tag => 
            tag.toLowerCase() === 'vegetarian' || tag.toLowerCase() === 'veg');
        const isVegan = !vegan || item.tags.some(tag => 
            tag.toLowerCase() === 'vegan' || tag.toLowerCase() === 'plant-based');
        
        // Check location and meal time - updated for new model structure
        const matchesLocation = !diningHall || item.dining_hall === diningHall;
        const matchesTime = !mealTime || item.meal_period === mealTime;
        
        // Check allowed and disallowed tags
        const hasAllowedTags = allowedTags.length === 0 || 
                              allowedTags.some(tag => item.tags.some(itemTag => 
                                itemTag.toLowerCase() === tag.toLowerCase()));
                                
        const hasNoDisallowedTags = !disallowedTags.some(tag => item.tags.some(itemTag => 
            itemTag.toLowerCase() === tag.toLowerCase()));
        
        // Check allergens - if user specifies allergens, exclude items with those allergens
        const hasNoAllergens = allergens.length === 0 || 
                              !allergens.some(allergen => item.tags.some(tag => 
                                tag.toLowerCase() === allergen.toLowerCase()));
        
        return isVeg && isVegan && matchesLocation && matchesTime && 
               hasAllowedTags && hasNoDisallowedTags && hasNoAllergens;
    });

    // If no items match the filter criteria, return error
    if (filteredMenu.length === 0) {
        return {
            success: false,
            message: "No items match your dietary preferences. Try adjusting your filters.",
            selectedItems: [],
            totals: { calories: 0, protein: 0, sugar: 0, fat: 0 }
        };
    }

    // Score menu items based on nutritional value - updated to use nutrition object
    const scored = filteredMenu.map(item => {
        const calories = item.nutrition?.fat * 9 + item.nutrition?.protein * 4 + item.nutrition?.carbs * 4 || 1;
        const protein = item.nutrition?.protein || 0;
        const sugar = item.nutrition?.sugar || 0;
        const fat = item.nutrition?.fat || 0;
        
        // Calculate nutrition score - higher protein is good, lower sugar and fat is good
        const proteinScore = (protein / calories) * 0.6;
        const sugarPenalty = (sugar / calories) * 0.25;
        const fatPenalty = (fat / calories) * 0.15;
        
        const score = proteinScore - sugarPenalty - fatPenalty;
        
        return { ...item, score, calculatedCalories: calories };
    }).sort((a, b) => b.score - a.score);

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
    for (const item of scored) {
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
                station: item.station
            });
        }

        // If we've reached our targets, stop adding items
        if (totals.calories >= targetCalories * 0.95 && totals.protein >= minProtein) break;
    }

    // Second pass: If we haven't reached calorie goal, add more items
    if (totals.calories < targetCalories * 0.95) {
        // Filter items we haven't fully used yet
        const remainingItems = scored.filter(item => 
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
                
                // If this is a new item, add it to selected items
                if (!usedItems.has(item.name)) {
                    usedItems.add(item.name);
                    selectedItems.push({
                        name: item.name,
                        servings: servings,
                        calories: calories * servings,
                        protein: protein * servings,
                        sugar: sugar * servings,
                        fat: fat * servings,
                        category: category,
                        dining_hall: item.dining_hall,
                        station: item.station
                    });
                } else {
                    // Otherwise increase servings of existing item
                    const existingItem = selectedItems.find(i => i.name === item.name);
                    if (existingItem) {
                        existingItem.servings += servings;
                        existingItem.calories += calories * servings;
                        existingItem.protein += protein * servings;
                        existingItem.sugar += sugar * servings;
                        existingItem.fat += fat * servings;
                    }
                }
            }

            // Stop if we've reached our calorie goal
            if (totals.calories >= targetCalories * 0.95) break;
        }
    }

    // Check if nutritional targets were met
    const calorieDiff = Math.round(totals.calories - targetCalories);
    const withinCalorieRange = totals.calories >= targetCalories * 0.95 && totals.calories <= targetCalories * 1.05;
    const metProtein = totals.protein >= minProtein;
    const underSugar = !maxSugar || totals.sugar <= maxSugar * 1.1;
    const underFat = !maxFat || totals.fat <= maxFat * 1.1;

    // Add warnings if targets not met
    if (!withinCalorieRange) {
        warnings.push(`Calorie target not fully met (${Math.round(totals.calories)} vs ${targetCalories}, diff: ${calorieDiff})`);
    }
    if (!metProtein) {
        warnings.push(`Protein target not met (${Math.round(totals.protein)}g vs ${minProtein}g)`);
    }
    if (!underSugar) {
        warnings.push(`Sugar limit exceeded (${Math.round(totals.sugar)}g vs ${maxSugar}g)`);
    }
    if (!underFat) {
        warnings.push(`Fat limit exceeded (${Math.round(totals.fat)}g vs ${maxFat}g)`);
    }

    // Group selected items by category for better presentation
    const itemsByCategory = {};
    selectedItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    });

    return {
        success: true,
        selectedItems,
        itemsByCategory,
        totals: {
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            sugar: Math.round(totals.sugar),
            fat: Math.round(totals.fat)
        },
        warnings,
        message: warnings.length > 0
            ? `Meal plan generated with some warnings.`
            : `Optimal meal plan generated with ${selectedItems.length} items.`
    };
}
