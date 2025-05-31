// Test script to simulate frontend API call
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

const testFrontendRequest = async () => {
  try {
    console.log('Testing frontend-style API request...');
    

    const preferences = {
      targetCalories: 2000,
      minProtein: 50,
      maxSugar: undefined,
      maxFat: undefined,
      vegetarian: false,
      vegan: false,
      allowedTags: [],
      disallowedTags: [],
      allergens: [],
      diningHall: "Bruin Plate",
      mealTime: "lunch"
    };
    
    console.log('Sending preferences:', preferences);
    
    const response = await axios.post(`${API_BASE_URL}/mealplans/generate-test`, preferences, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', {
      message: response.data.message,
      selectedItemsCount: response.data.mealPlan?.selectedItems?.length || 0,
      totals: response.data.mealPlan?.totals
    });
    
  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testFrontendRequest(); 