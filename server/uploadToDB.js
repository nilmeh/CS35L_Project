import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import MenuItem from './models/MenuItem.js';  // Adjust relative path if needed
import dotenv from 'dotenv';

dotenv.config();

// Use a default URI for testing if environment variable is not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ucla-meal-planner';

function transformRawData(raw) {
  const items = [];

  const parseNutrition = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.\-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };
  for(const [date, dateData] of Object.entries(raw)) {
    for (const [meal_period, halls] of Object.entries(dateData.meals)) {
      for (const [dining_hall, entries] of Object.entries(halls)) {
        for (const entry of entries) {
          const item = {
            date: new Date(date),
            dining_hall,
            meal_period,
            name: entry.name || '',
            station: entry.station || '',
            tags: entry.tags || [],
            ingredients: entry.ingredients || [],
            allergens: entry.allergens || [],
            nutrition: {
              protein: parseNutrition(entry.protein),
              fat: parseNutrition(entry.fat),
              carbs: parseNutrition(entry.carbs),
              sugar: parseNutrition(entry.sugar)
            }
          };

          items.push(item);
        }
      }
    }
  }
  console.log(`Total items processed: ${items.length}`);
  return items;
}

async function upload() {
  try {
    console.log('Attempting to connect to MongoDB with URI:', MONGO_URI ? 'URI provided' : 'No URI provided');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Read organised JSON
    const filePath = path.resolve('./data', 'organized_results.json');
    const rawJson = await fs.readFile(filePath, 'utf-8');
    const rawData = JSON.parse(rawJson);

    // Transform data
    const docs = transformRawData(rawData);
    console.log(`Transformed ${docs.length} items for upload.`);

    // Clear and insert
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(docs);
    console.log('Upload complete: all items inserted.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

upload();