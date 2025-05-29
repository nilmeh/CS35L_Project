import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import MenuItem from './models/MenuItem.js';  // Adjust relative path if needed
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

function transformRawData(raw) {
  const items = [];

  // Parse nutrition values from strings like "6.5g" to numbers
  const parseNutrition = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove 'g' and any other non-numeric characters, then parse
      const cleaned = value.replace(/[^0-9.\-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  for (const [meal_period, halls] of Object.entries(raw)) {
    for (const [dining_hall, entries] of Object.entries(halls)) {
      for (const entry of entries) {
        const item = {
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

    if (docs.length > 0) {
      console.log('Sample transformed item:');
      console.log(JSON.stringify(docs[0], null, 2));
    }

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