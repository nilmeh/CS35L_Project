import mongoose from 'mongoose';

const nutritionSchema = new mongoose.Schema({
  amount: { type: Number, set: n => parseFloat(n) },
  dv: { 
    type: Number, 
    set: n => n === null ? null : parseFloat(n),
    default: null
  }
});


const menuItemSchema = new mongoose.Schema({
  dining_hall: { type: String, required: true },
  meal_period: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  name: { type: String, required: true },
  allergens: { type: [String], default: [], required: true },
  nutrition: {
    "Total Fat": { type: nutritionSchema, required: true },
    "Saturated Fat": { type: nutritionSchema, required: true },
    "Trans Fat": { type: nutritionSchema, required: true },
    "Cholesterol": { type: nutritionSchema, required: true },
    "Sodium": { type: nutritionSchema, required: true },
    "Total Carbohydrate": { type: nutritionSchema, required: true },
    "Dietary Fiber": { type: nutritionSchema, required: true },
    "Sugars": { type: nutritionSchema, required: true },
    "Includes Added Sugars": { type: nutritionSchema, required: true },
    "Protein": { type: nutritionSchema, required: true },
    "Calcium": { type: nutritionSchema, required: true },
    "Iron": { type: nutritionSchema, required: true },
    "Potassium": { type: nutritionSchema, required: true },
    "Vitamin D": { type: nutritionSchema, required: true },
  }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;