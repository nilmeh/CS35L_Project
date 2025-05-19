// Returns information from results.json into a neater format in the file organized_results.json

const fs = require('fs');
const path = require('path');

function readResultsFile() {
  try {
    const filePath = path.join(__dirname, 'results.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading results.json:', error);
    return null;
  }
}

function organizeResults() {
    try {
        const data = readResultsFile();
        const organizedData = {};
        if (!data) return {};

        data.forEach(item => {
            // Fixed: Use item instead of data
            const timePeriod = item.meal_period || 'unknown';
            const hall = item.dining_hall || 'unknown';
            const name = item.name || 'unknown';
            const ingredients = item.ingredients || [];
            const allergens = item.allergens || [];
            const nutrition = item.nutrition || {};
            const station = item.station || 'unknown';
            const tags = item.tags || [];

            if(!organizedData[timePeriod]) {
                organizedData[timePeriod] = {};
            }
            if(!organizedData[timePeriod][hall]) {
                organizedData[timePeriod][hall] = [];
            }
            
            // Extract nutritional information safely with defaults
            let protein = 0, fat = 0, carbs = 0, sugar = 0;
            
            if (nutrition["Protein"] && nutrition["Protein"].amount) {
                protein = nutrition["Protein"].amount;
            }
            if (nutrition["Total Fat"] && nutrition["Total Fat"].amount) {
                fat = nutrition["Total Fat"].amount;
            }
            if (nutrition["Total Carbohydrate"] && nutrition["Total Carbohydrate"].amount) {
                carbs = nutrition["Total Carbohydrate"].amount;
            }
            if (nutrition["Sugars"] && nutrition["Sugars"].amount) {
                sugar = nutrition["Sugars"].amount;
            }
            
            
            organizedData[timePeriod][hall].push({
                "name": name, 
                "station": station || 'unknown',
                "tags": tags,
                "ingredients": ingredients, 
                "allergens": allergens, 
                "protein": protein, 
                "fat": fat, 
                "carbs": carbs, 
                "sugar": sugar,
               
            });
        });
        return organizedData;
    }
    catch(error) {
        console.error('Error organizing results:', error);
        return null;
    }
}

function writeResultsToFile(organizedData) {
  try {
    const filePath = path.join(__dirname, 'organized_results.json');
    fs.writeFileSync(filePath, JSON.stringify(organizedData, null, 2), 'utf8');
    console.log('Organized results written to organized_results.json');
  } catch (error) {
    console.error('Error writing organized results:', error);
  }
}



function main() {
  // Fixed: Use the corrected function name
  const organizedData = organizeResults();
  if (organizedData) {
    writeResultsToFile(organizedData);
  } else {
    console.error('Failed to organize results.');
  }
}

main();