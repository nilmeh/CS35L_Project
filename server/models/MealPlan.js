import mongoose from 'mongoose';
import MenuItem from './MenuItem.js';
const { Schema } = mongoose;

const mealPlanSchema = new Schema({
  userId: { type: String, required: false }, // for Firebase auth later
  date: { type: Date, required: true },
  plan: {
    breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }]
  },
  allergensAvoided: {
    type: [String],
    default: [],
    required: true
  },
  vegetarian: {
    type: Boolean,
    default: false,
    required: true
  },
  calories: { type: Number, required: true },
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
