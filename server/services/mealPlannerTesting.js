export const testUser = {
    targetCalories: 2200,
    minProtein: 100,
    maxSugar: 50,
    maxFat: 80,
    vegetarian: true,
    allowedTags: ["Main Course", "Side", "Soup", "High-Protein"],
    disallowedTags: ["Dessert"],
    diningHall: "De Neve",
    mealTime: "lunch"
  };

  export const testMenu = [
    {
      name: "Tofu Stir Fry",
      calories: 250,
      protein: 22,
      sugar: 4,
      fat: 8,
      tags: ["vegetarian", "Main Course", "Asian", "High-Protein"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Quinoa Salad",
      calories: 200,
      protein: 10,
      sugar: 2,
      fat: 5,
      tags: ["vegetarian", "Side", "Low-Carb"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Lentil Soup",
      calories: 180,
      protein: 14,
      sugar: 3,
      fat: 4,
      tags: ["vegetarian", "Soup", "High-Protein"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Vegan Pasta Bake",
      calories: 320,
      protein: 18,
      sugar: 5,
      fat: 10,
      tags: ["vegetarian", "Main Course", "Italian"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Chickpea Curry",
      calories: 300,
      protein: 15,
      sugar: 6,
      fat: 12,
      tags: ["vegetarian", "Main Course", "Indian"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Brown Rice Pilaf",
      calories: 220,
      protein: 6,
      sugar: 1,
      fat: 2,
      tags: ["vegetarian", "Side", "Low-Fat"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Grilled Vegetable Plate",
      calories: 160,
      protein: 5,
      sugar: 3,
      fat: 3,
      tags: ["vegetarian", "Side", "Low-Calorie"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Chocolate Brownie",
      calories: 450,
      protein: 3,
      sugar: 30,
      fat: 20,
      tags: ["vegetarian", "Dessert"],
      location: "De Neve",
      mealTime: "lunch"
    }
  ];

import { generateMealPlan } from './mealPlanner.js';

const result = generateMealPlan(testUser, testMenu);

console.log("\n✅ Selected Meal Plan:");
console.table(result.selectedItems);

console.log("\n📊 Totals:");
console.table(result.totals);

console.log("\n🏷️ Tag Breakdown:");
console.table(result.tagCount);

console.log("\nℹ️ Status:", result.message);