import MealPlan from '../models/MealPlan.js';

export const getAllMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find().populate('plan');
    res.status(200).json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal plans', error });
  }
};

//TODO: By User

export const createMealPlan = async (req, res) => {
  try {
    const mealPlan = new MealPlan(req.body);
    await mealPlan.save();
    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(400).json({ message: 'Error creating meal plan', error });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    await MealPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Meal plan deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meal plan', error });
  }
};