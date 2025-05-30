import MealPlan from '../models/MealPlan.js';
import MenuItem from '../models/MenuItem.js';
import { generateMealPlan } from '../services/mealPlanner.js';

// Get all meal plans for a user
export const getMealPlanByUser = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { page = 1, limit = 10, date, mealTime } = req.query;
    
    // Build query filters
    const filters = { userId };
    if (date) {
      const queryDate = new Date(date);
      filters.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }
    if (mealTime) {
      filters.mealTime = mealTime;
    }
    
    const plans = await MealPlan.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await MealPlan.countDocuments(filters);
    
    res.status(200).json({
      plans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPlans: total
    });
  } catch (error) {
    console.error('Error fetching user meal plans:', error);
    res.status(500).json({ message: 'Error fetching user meal plans', error: error.message });
  }
};

// Get a specific meal plan by ID
export const getMealPlanById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const mealPlan = await MealPlan.findOne({ _id: id, userId });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    res.status(200).json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ message: 'Error fetching meal plan', error: error.message });
  }
};

// Create a new meal plan
export const createMealPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { 
      name, 
      date, 
      mealTime, 
      diningHall, 
      items, 
      preferences,
      isGenerated = false,
      isCustomized = false
    } = req.body;

    // Validate required fields
    if (!name || !date || !mealTime || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, date, mealTime, and items are required' 
      });
    }

    // Validate and process items
    const processedItems = items.map(item => {
      if (!item.name || !item.dining_hall || 
          item.calories === undefined || item.protein === undefined || 
          item.sugar === undefined || item.fat === undefined) {
        throw new Error('Each item must have name, dining_hall, calories, protein, sugar, and fat');
      }
      
      return {
        ...item,
        servings: item.servings || 1,
        carbs: item.carbs || 0,
        fiber: item.fiber || 0,
        sodium: item.sodium || 0,
        category: item.category || 'Main Course',
        allergens: item.allergens || [],
        vegetarian: item.vegetarian || false,
        vegan: item.vegan || false
      };
    });

    const mealPlan = new MealPlan({
      userId,
      name,
      date: new Date(date),
      mealTime,
      diningHall,
      items: processedItems,
      preferences: preferences || {},
      isGenerated,
      isCustomized
    });

    await mealPlan.save();
    
    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(400).json({ message: 'Error creating meal plan', error: error.message });
  }
};

// Update an existing meal plan
export const updateMealPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the meal plan
    const mealPlan = await MealPlan.findOne({ _id: id, userId });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['name', 'date', 'mealTime', 'diningHall', 'items', 'preferences', 'isFavorite'];
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'items' && Array.isArray(updateData[field])) {
          // Process items to ensure they have all required fields
          mealPlan[field] = updateData[field].map(item => ({
            ...item,
            servings: item.servings || 1,
            carbs: item.carbs || 0,
            fiber: item.fiber || 0,
            sodium: item.sodium || 0,
            category: item.category || 'Main Course',
            allergens: item.allergens || [],
            vegetarian: item.vegetarian || false,
            vegan: item.vegan || false
          }));
        } else {
          mealPlan[field] = updateData[field];
        }
      }
    });
    
    // Mark as customized if items were modified
    if (updateData.items) {
      mealPlan.isCustomized = true;
    }
    
    await mealPlan.save();
    
    res.status(200).json({
      message: 'Meal plan updated successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(400).json({ message: 'Error updating meal plan', error: error.message });
  }
};

// Delete a meal plan
export const deleteMealPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    
    const mealPlan = await MealPlan.findOne({ _id: id, userId });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    await mealPlan.deleteOne();
    res.status(200).json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ message: 'Error deleting meal plan', error: error.message });
  }
};

// Save a generated meal plan (from PreferencesPage results)
export const saveMealPlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { 
      mealPlan, 
      preferences, 
      name 
    } = req.body;

    if (!mealPlan || !mealPlan.selectedItems || !preferences) {
      return res.status(400).json({ 
        message: 'Missing required data: mealPlan with selectedItems and preferences are required'
      });
    }

    const planName = name || `${preferences.mealTime || 'Meal'} Plan - ${new Date(preferences.date).toLocaleDateString()}`;
    
    const items = mealPlan.selectedItems.map((item, index) => {
      if (!item.name || !item.dining_hall || 
          item.calories === undefined || item.protein === undefined || 
          item.sugar === undefined || item.fat === undefined) {
        throw new Error(`Item ${index + 1} (${item.name || 'unnamed'}) missing required nutritional data`);
      }
      
      return {
        name: item.name,
        dining_hall: item.dining_hall,
        station: item.station || '',
        calories: item.calories || 0,
        protein: item.protein || 0,
        sugar: item.sugar || 0,
        fat: item.fat || 0,
        servings: item.servings || 1,
        carbs: item.carbs || 0,
        fiber: item.fiber || 0,
        sodium: item.sodium || 0,
        category: item.category || 'Main Course',
        allergens: item.allergens || [],
        vegetarian: item.vegetarian || false,
        vegan: item.vegan || false
      };
    });

    const nutritionTotals = items.reduce((acc, item) => {
      const servings = item.servings || 1;
      acc.calories += (item.calories || 0) * servings;
      acc.protein += (item.protein || 0) * servings;
      acc.sugar += (item.sugar || 0) * servings;
      acc.fat += (item.fat || 0) * servings;
      acc.carbs += (item.carbs || 0) * servings;
      acc.fiber += (item.fiber || 0) * servings;
      acc.sodium += (item.sodium || 0) * servings;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      sugar: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sodium: 0
    });

    const savedPlan = new MealPlan({
      userId,
      name: planName,
      date: new Date(preferences.date),
      mealTime: preferences.mealTime,
      diningHall: preferences.diningHall,
      items,
      nutritionTotals,
      preferences: {
        targetCalories: preferences.targetCalories,
        minProtein: preferences.minProtein,
        maxSugar: preferences.maxSugar,
        allergensToAvoid: preferences.allergensToAvoid || [],
        vegetarian: preferences.vegetarian || false,
        vegan: preferences.vegan || false,
        diningHall: preferences.diningHall,
        mealTime: preferences.mealTime
      },
      isGenerated: true,
      isCustomized: false
    });

    await savedPlan.save();
    
    res.status(201).json({
      message: 'Meal plan saved successfully',
      mealPlan: savedPlan
    });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(400).json({ 
      message: 'Error saving meal plan', 
      error: error.message
    });
  }
};

// Generate a meal plan (existing functionality)
export const generateMealPlanForUser = async (req, res) => {
  try {
    const preferences = req.body;
    
    if (!preferences.targetCalories || !preferences.minProtein) {
      return res.status(400).json({
        message: 'Missing required preferences: targetCalories and minProtein are required'
      });
    }
    
    const { diningHall, mealTime, date } = preferences;
    
    const filter = {};
    if (diningHall) filter.dining_hall = diningHall;
    if (mealTime) filter.meal_period = mealTime;
    
    if (date) {
      const queryDate = new Date(date);
      filter.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }
    
    const menuItems = await MenuItem.find(filter);
    
    if (menuItems.length === 0) {
      return res.status(404).json({ 
        message: 'No menu items found for the specified preferences',
        filter 
      });
    }
    
    const result = await generateMealPlan(preferences, menuItems);
    
    res.status(200).json({
      message: result.message || 'Meal plan generated successfully',
      mealPlan: result
    });
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ 
      message: 'Error generating meal plan', 
      error: error.message 
    });
  }
};