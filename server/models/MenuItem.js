import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  dining_hall: { type: String, required: true },
  meal_period: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  name: { type: String, required: true },
  station: { type: String, required: true },
  tags: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  allergens: { type: [String], default: [] },
  nutrition: {
    protein: { type: Number, default: 0 }, // in grams
    fat: { type: Number, default: 0 }, // in grams
    carbs: { type: Number, default: 0 }, // in grams  
    sugar: { type: Number, default: 0 } // in grams
  }
}, {
  timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;