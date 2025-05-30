import MealPlan from '../models/MealPlan.js';
import MenuItem from '../models/MenuItem.js';
import { generateMealPlan } from '../services/mealPlanner.js';

export const getMealPlanByUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const plans = await MealPlan.find({ userId }).populate({
      path: 'plan.breakfast plan.lunch plan.dinner',
    });
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user meal plans', error });
  }
};

export const createMealPlan = async (req, res) => {
  try {
    const { date, plan, allergensAvoided, vegetarian, calories } = req.body;

    const mealPlan = new MealPlan({
      userId: req.user.uid,
      date,
      plan,
      allergensAvoided,
      vegetarian,
      calories,
    });

    await mealPlan.save();
    const populated = await mealPlan.populate({
      path: 'plan.breakfast plan.lunch plan.dinner',
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Error creating meal plan', error });
  }
};

export const generateMealPlanForUser = async (req, res) => {
  try {
    const {
      targetCalories = 2000,
      minProtein = 50,
      maxSugar,
      maxFat,
      vegetarian = false,
      vegan = false,
      allowedTags = [],
      disallowedTags = [],
      allergens = [],
      excludedCategories = [],
      likedFoods = [],
      dislikedFoods = [],
      diningHall,
      mealTime,
      date,
      regenerationType = 'default', // 'default' or 'regenerate'
      variationSeed
    } = req.body;

    // Validate input
    if (targetCalories <= 0) {
      return res.status(400).json({ message: 'Target calories must be positive' });
    }
    if (minProtein < 0) {
      return res.status(400).json({ message: 'Minimum protein must be non-negative' });
    }

    // Fetch menu items based on preferences
    const filter = {};
    if (diningHall) filter.dining_hall = diningHall;
    if (mealTime) filter.meal_period = mealTime;
    
    // Add date filtering if provided
    if (date) {
      // Parse the date and create a range for the entire day
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const menuItems = await MenuItem.find(filter);

    if (menuItems.length === 0) {
      return res.status(404).json({ 
        message: 'No menu items found for the specified preferences',
        filter 
      });
    }

    // Generate variation seed if this is a regenerate request
    let finalVariationSeed = variationSeed;
    if (regenerationType === 'regenerate' && !variationSeed) {
      finalVariationSeed = Date.now() % 10000; // Use timestamp for uniqueness
    }

    // Generate meal plan using the algorithm with variation
    const userPreferences = {
      targetCalories,
      minProtein,
      maxSugar,
      maxFat,
      vegetarian,
      vegan,
      allowedTags,
      disallowedTags,
      allergens,
      excludedCategories,
      likedFoods,
      dislikedFoods,
      diningHall,
      mealTime,
      variationSeed: finalVariationSeed,
      regenerationType
    };

    const result = await generateMealPlan(userPreferences, menuItems);

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
        selectedItems: result.selectedItems,
        totals: result.totals,
        debug: result.debug
      });
    }

    res.status(200).json({
      message: result.message,
      mealPlan: {
        selectedItems: result.selectedItems,
        itemsByCategory: result.itemsByCategory,
        totals: result.totals,
        warnings: result.warnings,
        variationInfo: result.variationInfo
      },
      preferences: userPreferences,
      availableItems: menuItems.length
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ message: 'Error generating meal plan', error: error.message });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    if (mealPlan.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this plan' });
    }

    await mealPlan.deleteOne();
    res.status(200).json({ message: 'Meal plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal plan', error });
  }
};