import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import MenuItem from './models/MenuItem.js';  // Adjust relative path if needed
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

function transformRawData(raw) {
  const items = [];

  // Nutrient keys required by schema
  const nutrientKeys = [
    "Total Fat",
    "Saturated Fat",
    "Trans Fat",
    "Cholesterol",
    "Sodium",
    "Total Carbohydrate",
    "Dietary Fiber",
    "Sugars",
    "Includes Added Sugars",
    "Protein",
    "Calcium",
    "Iron",
    "Potassium",
    "Vitamin D"
  ];

  for (const [meal_period, halls] of Object.entries(raw)) {
    for (const [dining_hall, entries] of Object.entries(halls)) {
      for (const entry of entries) {
        // Parse numeric macro fields
        const parseNumeric = val => {
          if (val == null) return null;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9.\-]/g, '');
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };

        // Build full nutrition object matching schema
        const nutrition = {};
        nutrientKeys.forEach(key => {
          let amount = 0;
          if (key === 'Total Fat') amount = parseNumeric(entry.fat);
          else if (key === 'Protein') amount = parseNumeric(entry.protein);
          else if (key === 'Total Carbohydrate') amount = parseNumeric(entry.carbs);
          else if (key === 'Sugars') amount = parseNumeric(entry.sugar);
          // Other keys default to 0
          nutrition[key] = { amount, dv: null };
        });

        items.push({
          dining_hall,
          meal_period,
          name: entry.name,
          allergens: entry.allergens || [],
          nutrition,
        });
      }
    }
  }

  return items;
}

async function upload() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Read organised JSON
    const filePath = path.resolve('../scraper', 'organized_results.json');
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