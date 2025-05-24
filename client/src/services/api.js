const API_URL = 'http://localhost:3001/api';

export const generateMealPlan = async (preferences) => {
  try {
    const response = await fetch(`${API_URL}/meal-plans/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate meal plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};