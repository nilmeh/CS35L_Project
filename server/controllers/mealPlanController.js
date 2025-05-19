import MealPlan from '../models/MealPlan.js';

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