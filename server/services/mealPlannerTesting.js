import fs from 'fs';
import path from 'path';
import { generateMealPlan } from './mealPlanner.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This would normally load the full data
const dataPath = path.join(__dirname, '../data/organized_results.json');

// Load and parse menu data
const rawMenuData = fs.readFileSync(dataPath, 'utf-8');
const menuData = JSON.parse(rawMenuData);

/**
 * Convert nutrition string values to numbers
 * @param {string} value - Nutrition value as string
 * @returns {number} - Parsed number
 */
function parseNutritionValue(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
}

/**
 * Flatten the nested structure of organized_results.json
 * @param {Object} nestedData - The nested JSON structure
 * @returns {Array} - Flattened array of menu items
 */
function flattenMenuData(nestedData) {
  const flattenedData = [];
  
  // Iterate through meal periods (breakfast, lunch, dinner)
  for (const [mealPeriod, diningHalls] of Object.entries(nestedData)) {
    // Iterate through dining halls for each meal period
    for (const [diningHall, items] of Object.entries(diningHalls)) {
      // Add each item to the flattened array with meal period and dining hall info
      if (Array.isArray(items)) {
        items.forEach(item => {
          // Get standardized dining hall name for consistent filtering
          let normalizedDiningHall = diningHall.toLowerCase();
          
          // Make sure normalized name exactly matches what's used in test cases
          if (normalizedDiningHall === "bruin plate") normalizedDiningHall = "bruin plate";
          if (normalizedDiningHall === "de neve") normalizedDiningHall = "de neve dining"; 
          if (normalizedDiningHall === "epicuria at covel") normalizedDiningHall = "epicuria at covel";
          if (normalizedDiningHall === "spice kitchen at feast") normalizedDiningHall = "spice kitchen at feast";
          
          flattenedData.push({
            ...item,
            meal_period: mealPeriod.toLowerCase(),
            dining_hall: diningHall,
            location: normalizedDiningHall
          });
        });
      }
    }
  }
  
  // Log available dining halls for debugging
  const uniqueDiningHalls = [...new Set(flattenedData.map(item => item.location))];
  console.log("Available dining halls:", uniqueDiningHalls);
  
  console.log(`Flattened ${flattenedData.length} menu items from ${Object.keys(nestedData).length} meal periods`);
  return flattenedData;
}

/**
 * Enhances menu data with more accurate tags based on item details
 * @param {Array} data - Raw menu data 
 * @returns {Array} - Enhanced menu data
 */
function enhanceMenuDataForTesting(data) {
  return data.map(item => {
    // Extract and convert nutrition information
    const protein = parseNutritionValue(item.protein);
    const fat = parseNutritionValue(item.fat);
    const carbs = parseNutritionValue(item.carbs);
    const sugar = parseNutritionValue(item.sugar);
    
    // Calculate calories if not provided directly
    let calories = 0;
    if (item.calories) {
      calories = parseNutritionValue(item.calories);
    } else {
      // If no calories provided, calculate from macros (4-4-9 method)
      calories = (carbs * 4) + (protein * 4) + (fat * 9);
    }

    // Use existing tags or create new array
    const tags = Array.isArray(item.tags) ? [...item.tags] : [];
    
    // Normalize tag cases for consistency
    for (let i = 0; i < tags.length; i++) {
      // Convert diet preference tags to lowercase for consistent matching
      if (tags[i] === "Vegetarian") tags[i] = "vegetarian";
      if (tags[i] === "Vegan") tags[i] = "vegan";
      
      // Convert allergen tags to lowercase with contains- prefix
      if (tags[i].startsWith("Contains ")) {
        const allergen = tags[i].replace("Contains ", "").toLowerCase();
        tags[i] = `contains-${allergen}`;
      }
    }
    
    // Ensure vegan items are also tagged as vegetarian
    if (tags.includes("vegan") && !tags.includes("vegetarian")) {
      tags.push("vegetarian");
    }
    
    // Add meal period tags
    if (item.meal_period) {
      tags.push(item.meal_period.toLowerCase());
    }
    
    // Add location tags
    if (item.location && !tags.includes(item.location)) {
      tags.push(item.location);
    }
    
    // Add station-based tags
    if (item.station && !tags.includes(item.station)) {
      tags.push(item.station);
    }
    
    // Add nutritional tags
    if (protein > 15) {
      tags.push("High-Protein");
    }
    if (sugar < 5) {
      tags.push("Low-Sugar");
    }
    if ((fat * 9) / calories < 0.2) {
      tags.push("Low-Fat");
    }
    
    // Add food category based on station
    let category = "Main Course"; // default
    if (item.station) {
      // Define station-to-category mapping
      const stationMap = {
        "The Pizzeria": "Main Course",
        "The Grill": "Main Course", 
        "Harvest Kitchen": "Main Course",
        "The Sweet Stop": "Dessert",
        "Seasonal Sides": "Side",
        "Field Greens Bar": "Side"
      };
      
      if (stationMap[item.station]) {
        category = stationMap[item.station];
        if (!tags.includes(category)) {
          tags.push(category);
        }
      }
    }
    
    // Add allergen-based tags from the allergens array
    if (item.allergens && Array.isArray(item.allergens)) {
      item.allergens.forEach(allergen => {
        if (allergen !== "None") {
          const allergenTag = `contains-${allergen.toLowerCase()}`;
          if (!tags.includes(allergenTag)) {
            tags.push(allergenTag);
          }
        }
      });
    }

    return {
      name: item.name,
      calories: calories,
      protein: protein,
      sugar: sugar,
      fat: fat,
      tags: tags,
      station: item.station,
      category: category,
      ingredients: item.ingredients || [],
      location: item.location || "unknown",
      mealTime: item.meal_period || "all-day"
    };
  });
}

// Flatten the nested data structure and then enhance it
const flattenedData = flattenMenuData(menuData);
const formattedMenuData = enhanceMenuDataForTesting(flattenedData);

console.log(`Processed ${formattedMenuData.length} menu items for testing.`);

/**
 * Run multiple test cases to showcase different features of the meal planner
 */
function runTests() {
  console.log("🍽️ UCLA DINING MEAL PLANNER TESTS 🍽️\n");
  
  // Test Case 1: Standard meal plan
  const standardUser = {
    targetCalories: 800,       
    minProtein: 40,           
    maxSugar: 30,              
    maxFat: 30,
    vegetarian: false,    
    allowedTags: ["Main Course", "Side", "Soup"],
    diningHall: "bruin plate", 
    mealTime: "breakfast"         
  };
  
  console.log("📋 TEST CASE 1: Standard breakfast plan at Bruin Plate");
  runTestCase(standardUser);
  
  // Test Case 2: Vegetarian meal plan
  const vegetarianUser = {
    targetCalories: 600,
    minProtein: 25,
    maxSugar: 25,
    maxFat: 20,
    vegetarian: true,
    vegan: false,
    allowedTags: [],
    diningHall: "bruin plate",
    mealTime: "lunch"
  };
  
  console.log("\n\n📋 TEST CASE 2: Vegetarian lunch plan at Bruin Plate");
  runTestCase(vegetarianUser);
  
  // Test Case 3: Realistic De Neve dinner plan (modified to be more realistic)
  const deNeveUser = {
    targetCalories: 1000,
    minProtein: 40,
    maxSugar: 20,
    maxFat: 35,
    vegetarian: false,
    allowedTags: ["Main Course", "Side"],
    disallowedTags: ["Dessert"],
    diningHall: "de neve dining",  
    mealTime: "dinner"
  };
  
  console.log("\n\n📋 TEST CASE 3: Realistic dinner plan at De Neve");
  runTestCase(deNeveUser);
  
  // Test Case 4: Vegetarian options at De Neve
  const deNeveVegetarianUser = {
    targetCalories: 800,
    minProtein: 25,
    maxSugar: 20,
    maxFat: 30,
    vegetarian: true,
    vegan: false,
    allowedTags: [],
    diningHall: "de neve dining",  
    mealTime: "dinner"
  };
  
  console.log("\n\n📋 TEST CASE 4: Vegetarian dinner plan at De Neve");
  runTestCase(deNeveVegetarianUser);
  
  // Test Case 5: Balanced meal plan for De Neve with more realistic values
  const balancedDeNeveUser = {
    targetCalories: 500,
    minProtein: 20,
    maxSugar: 30,
    maxFat: 25,
    vegetarian: false,
    allowedTags: [],
    diningHall: "de neve dining",  
    mealTime: "dinner"
  };
  
  console.log("\n\n📋 TEST CASE 5: Balanced dinner plan at De Neve");
  runTestCase(balancedDeNeveUser);
}

/**
 * Run a single test case with the given user preferences
 * @param {Object} userPreferences - User preferences for meal planning
 */
function runTestCase(userPreferences) {
  console.log("User Preferences:");
  console.table(userPreferences);
  
  // Find available items for this dining hall and meal time
  const availableItems = formattedMenuData.filter(item => 
    (!userPreferences.diningHall || item.location === userPreferences.diningHall) &&
    (!userPreferences.mealTime || item.mealTime === userPreferences.mealTime)
  );
  
  console.log(`Found ${availableItems.length} items matching location "${userPreferences.diningHall}" and meal time "${userPreferences.mealTime}"`);
  
  if (availableItems.length === 0) {
    console.log(`⚠️ No items found for ${userPreferences.diningHall} at ${userPreferences.mealTime}. Check data structure and spelling.`);
    // Show available locations and meal times in the data
    const locations = [...new Set(formattedMenuData.map(item => item.location))];
    const mealTimes = [...new Set(formattedMenuData.map(item => item.mealTime))];
    console.log("Available locations:", locations);
    console.log("Available meal times:", mealTimes);
    return;
  }
  
  const result = generateMealPlan(userPreferences, formattedMenuData);
  
  if (!result.success) {
    console.log("\n❌ Failed to generate meal plan:", result.message);
    
    // Show a sample of available items that matched location and meal time for debugging
    console.log("\nSample of available items that matched criteria:");
    console.table(availableItems.slice(0, 5).map(item => ({
      name: item.name,
      station: item.station,
      protein: Math.round(item.protein),
      tags: item.tags.join(", "),
      vegetarian: item.tags.includes("vegetarian")
    })));
    return;
  }
  
  console.log("\n✅ Generated Meal Plan:");
  
  // Print items by category
  if (result.itemsByCategory) {
    for (const [category, items] of Object.entries(result.itemsByCategory)) {
      console.log(`\n${category} (${items.length} items):`);
      items.forEach(item => {
        console.log(`  • ${item.name} (x${item.servings}) - ${Math.round(item.calories)} cal, ${Math.round(item.protein)}g protein, ${item.station}`);
      });
    }
  } else {
    console.table(result.selectedItems.map(item => ({
      name: item.name,
      servings: item.servings,
      calories: Math.round(item.calories),
      protein: Math.round(item.protein),
      location: item.location
    })));
  }
  
  console.log("\n📊 Nutritional Totals:");
  console.table(result.totals);
  
  if (result.warnings && result.warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
  }
  
  console.log("\nℹ️ Status:", result.message);
}

// Run all tests
runTests();