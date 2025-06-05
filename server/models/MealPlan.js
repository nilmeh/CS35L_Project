import mongoose from 'mongoose';
import MenuItem from './MenuItem.js';
const { Schema } = mongoose;

const mealPlanSchema = new Schema({
  userId: { type: String, required: true },
  
  // Basic plan metadata
  name: { type: String, required: true },
  date: { type: Date, required: true },
  mealTime: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner'], 
    required: true 
  },
  diningHall: { type: String },
  
  // Meal items - now more flexible to support both ObjectIds and full item data
  items: [{
    // Can store either a reference to MenuItem or full item data for flexibility
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    
    // Full item data (for items that might not be in MenuItem collection)
    name: { type: String, required: true },
    dining_hall: { type: String, required: true },
    station: { type: String },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    sugar: { type: Number, required: true },
    fat: { type: Number, required: true },
    servings: { type: Number, default: 1, min: 1 },
    
    // Additional nutritional info
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    
    // Item metadata
    category: { type: String },
    allergens: [String],
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false }
  }],
  
  // Nutritional totals (calculated from items)
  nutritionTotals: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    sugar: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  
  // User preferences used to generate this plan
  preferences: {
    targetCalories: { type: Number },
    minProtein: { type: Number },
    maxSugar: { type: Number },
    allergensToAvoid: [String],
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    diningHall: { type: String },
    mealTime: { type: String }
  },
  
  // Plan metadata
  isGenerated: { type: Boolean, default: true }, // true if AI-generated, false if manually created
  isFavorite: { type: Boolean, default: false },
  isCustomized: { type: Boolean, default: false }, // true if user has modified the original generated plan
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps and calculate nutrition totals
mealPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate nutrition totals from items 
  const totals = this.items.reduce((acc, item) => {
    acc.calories += item.calories || 0;
    acc.protein += item.protein || 0;
    acc.sugar += item.sugar || 0;
    acc.fat += item.fat || 0;
    acc.carbs += item.carbs || 0;
    acc.fiber += item.fiber || 0;
    acc.sodium += item.sodium || 0;
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
  
  this.nutritionTotals = totals;
  next();
});

// Index for efficient queries
mealPlanSchema.index({ userId: 1, date: 1, mealTime: 1 });
mealPlanSchema.index({ userId: 1, createdAt: -1 });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;
