import fs from 'fs';
import path from 'path';
import { generateMealPlan } from './mealPlanner.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/ucla_dining_info.json');

const rawMenuData = fs.readFileSync(dataPath, 'utf-8');
const menuData = JSON.parse(rawMenuData);

function parseNutritionValue(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
}

const formattedMenuData = menuData.map(item => {
  const protein = parseNutritionValue(item.nutrition["Protein"]?.amount);
  const carbs = parseNutritionValue(item.nutrition["Total Carbohydrate"]?.amount);
  const fat = parseNutritionValue(item.nutrition["Total Fat"]?.amount);
  const sugar = parseNutritionValue(item.nutrition["Sugars"]?.amount);

  const tags = [];


  if (item.name.toLowerCase().includes("vegetarian") || item.name.toLowerCase().includes("vegan")) {
      tags.push("vegetarian");
  }

  if (item.name.toLowerCase().includes("water") || item.name.toLowerCase().includes("juice")) {
    tags.push("Beverage");
}
  // Automatically tag breakfast items if they are part of a breakfast meal period
  if (item.meal_period.toLowerCase() === "breakfast") {
      tags.push("Breakfast");
  }
  if (item.meal_period.toLowerCase() === "lunch") {
    tags.push("Lunch");
}

  if (protein / ((carbs * 4) + (protein * 4) + (fat * 9)) > 0.2) {
      tags.push("High-Protein");
  }

  return {
      name: item.name,
      calories: (carbs * 4) + (protein * 4) + (fat * 9),
      protein: protein,
      sugar: sugar,
      fat: fat,
      tags: tags,
      location: item.dining_hall.toLowerCase(),
      mealTime: item.meal_period.toLowerCase()
  };
});

const testUser = {
  targetCalories: 1000,       
  minProtein: 40,           
  maxSugar: 30,              
  maxFat: 50,               
  vegetarian: false,    
  allowedTags: ["Main Course", "Side", "Soup", "High-Protein", "Dessert", "Beverage", "Lunch"],
  diningHall: "de neve dining", 
  mealTime: "lunch"         
};

const result = generateMealPlan(testUser, formattedMenuData);

console.log("\n✅ Selected Meal Plan:");
console.table(result.selectedItems);

console.log("\n📊 Totals:");
console.table(result.totals);

console.log("\n🏷️ Tag Breakdown:");
console.table(result.tagCount);

console.log("\n⚠️ Warnings:");
console.log(result.warnings || "No warnings.");

console.log("\nℹ️ Status:", result.message);