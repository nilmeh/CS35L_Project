import MealPlan from '../models/MealPlan.js';
import MenuItem from "../models/MenuItem.js";
import { generateMealPlan } from "../services/mealPlanner.js";


export const generateOptimizedMealPlan = async (req, res) => {
  try {
    const preferences = req.body;
    
    // Build query based on preferences
    const query = {};
    
    if (preferences.diningHall) {
      query.location = preferences.diningHall.toLowerCase();
    }
    
    if (preferences.mealTime) {
      query.mealTime = preferences.mealTime.toLowerCase();
    }
    
    // Fetch menu items from database
    const menuItems = await MenuItem.find(query);
    
    if (menuItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No menu items found for the selected dining hall and meal time" 
      });
    }
    
    // Format items for the algorithm if needed
    const formattedItems = menuItems.map(item => ({
      name: item.name,
      calories: parseFloat(item.calories || 0),
      protein: parseFloat(item.protein || 0),
      sugar: parseFloat(item.sugar || 0),
      fat: parseFloat(item.fat || 0),
      tags: item.tags || [],
      category: item.category,
      station: item.station,
      location: item.location,
      mealTime: item.mealTime,
      ingredients: item.ingredients || []
    }));
    
    // Generate plan using the existing algorithm
    const plan = generateMealPlan(preferences, formattedItems);
    
    res.status(200).json(plan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate meal plan', 
      error: error.message 
    });
  }
};

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