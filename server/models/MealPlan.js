const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealPlanSchema = new Schema({
  userId: {type: String, required: false}, //for firebase auth later
  date: {type: Date, required: true},
  plan: {
    type: Map,
    of: new Schema({
      breakfast: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
      lunch: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
      dinner: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }]
    }),
    required: true
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
  calories: {type: Number, required: true},
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
