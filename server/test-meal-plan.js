import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import { generateMealPlan } from './services/mealPlanner.js';

// Load environment variables
dotenv.config({ path: '../.env' });

async function testMealPlan() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Fetch some menu items
    const menuItems = await MenuItem.find({
      dining_hall: 'Bruin Plate',
      meal_period: 'lunch'
    });

    console.log(`Found ${menuItems.length} items for Bruin Plate lunch`);
    console.log('Sample item:', {
      name: menuItems[0]?.name,
      dining_hall: menuItems[0]?.dining_hall,
      meal_period: menuItems[0]?.meal_period,
      nutrition: menuItems[0]?.nutrition,
      tags: menuItems[0]?.tags?.slice(0, 3)
    });

    console.log('Sample item structure:', Object.keys(menuItems[0]));
    console.log('Sample item JSON:', JSON.stringify(menuItems[0], null, 2));
    console.log('Full item object:', menuItems[0]);

    // Test meal plan generation
    const preferences = {
      targetCalories: 800,
      minProtein: 30,
      vegetarian: false,
      vegan: false,
      allowedTags: [],
      disallowedTags: [],
      allergens: [],
      diningHall: 'Bruin Plate',
      mealTime: 'lunch'
    };

    console.log('\nGenerating meal plan with preferences:', preferences);
    
    console.log('\nBefore enhancement:', {
      name: menuItems[0]?.name,
      dining_hall: menuItems[0]?.dining_hall,
      meal_period: menuItems[0]?.meal_period
    });
    
    const result = generateMealPlan(preferences, menuItems);
    
    console.log('\nResult:', {
      success: result.success,
      message: result.message,
      selectedItemsCount: result.selectedItems?.length || 0,
      totals: result.totals
    });

    if (result.debug) {
      console.log('\nDebug info:', result.debug);
    }

    if (result.selectedItems && result.selectedItems.length > 0) {
      console.log('\nSelected items:');
      result.selectedItems.forEach(item => {
        console.log(`- ${item.name} (x${item.servings}): ${item.calories} cal`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testMealPlan(); 