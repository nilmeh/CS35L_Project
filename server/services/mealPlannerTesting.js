export const testUser = {
    targetCalories: 2200,
    minProtein: 100,
    maxSugar: 50,
    maxFat: 80,
    vegetarian: false,
    allowedTags: ["Main Course", "Side", "Soup", "High-Protein", "Dessert"],
    diningHall: "De Neve",
    mealTime: "lunch"
  };

  export const testMenu = [
    {
      name: "Pork Pozole",
      calories: 350,
      protein: 25,
      sugar: 4,
      fat: 15,
      tags: ["Main Course", "Mexican", "High-Protein"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Vegetarian Pozole",
      calories: 300,
      protein: 12,
      sugar: 3,
      fat: 8,
      tags: ["vegetarian", "Soup", "Mexican"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Baja Fried Fish Taco",
      calories: 250,
      protein: 18,
      sugar: 2,
      fat: 10,
      tags: ["Main Course", "Seafood", "Mexican"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Santa Cruz Spicy Lentil & Avocado Crema Tacos",
      calories: 280,
      protein: 14,
      sugar: 3,
      fat: 9,
      tags: ["vegetarian", "Main Course", "Mexican"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Chicken Ranch Pizza",
      calories: 400,
      protein: 20,
      sugar: 5,
      fat: 18,
      tags: ["Main Course", "Pizza", "American"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Pepperoni Deluxe Pizza",
      calories: 420,
      protein: 22,
      sugar: 4,
      fat: 20,
      tags: ["Main Course", "Pizza", "American"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Cheese Pizza",
      calories: 380,
      protein: 18,
      sugar: 3,
      fat: 16,
      tags: ["vegetarian", "Main Course", "Pizza", "American"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Bruin Burger",
      calories: 450,
      protein: 25,
      sugar: 6,
      fat: 22,
      tags: ["Main Course", "American", "High-Protein"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Bruin Cheeseburger",
      calories: 480,
      protein: 26,
      sugar: 6,
      fat: 24,
      tags: ["Main Course", "American", "High-Protein"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "LA Hot Chicken Sandwich",
      calories: 460,
      protein: 24,
      sugar: 5,
      fat: 23,
      tags: ["Main Course", "American", "Spicy"],
      location: "De Neve",
      mealTime: "lunch"
    },
    {
      name: "Impossible Burger",
      calories: 420,
      protein: 20,
      sugar: 4,
      fat: 20,
      tags: ["vegetarian", "Main Course", "American", "Plant-Based"],
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