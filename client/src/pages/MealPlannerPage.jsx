import { useState } from 'react';
import PreferencesForm from '../components/PreferencesForm';
import { generateMealPlan } from '../services/api';
import './MealPlannerPage.css';

function MealPlannerPage() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (preferences) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert form preferences to match algorithm expectations
      const formattedPreferences = {
        targetCalories: parseInt(preferences.calories),
        minProtein: parseInt(preferences.minProtein),
        maxSugar: parseInt(preferences.maxSugar),
        maxFat: parseInt(preferences.maxFat),
        vegetarian: preferences.vegetarian,
        allowedTags: preferences.allowedTags,
        disallowedTags: preferences.disallowedTags,
        diningHall: preferences.diningHall,
        mealTime: preferences.mealTime
      };
      
      const result = await generateMealPlan(formattedPreferences);
      setMealPlan(result);
    } catch (error) {
      setError('Failed to generate meal plan. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meal-planner-page">
      <section className="preferences-section">
        <h1>UCLA Dining Meal Planner</h1>
        <p>Set your preferences below and generate a personalized meal plan.</p>
        <PreferencesForm onSubmit={handleSubmit} />
      </section>
      
      <section className="results-section">
        {loading && <div className="loading-spinner">Generating your meal plan...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {mealPlan && !loading && (
          <div className="meal-plan-results">
            <h2>Your Optimized Meal Plan</h2>
            
            {mealPlan.selectedItems && mealPlan.selectedItems.length > 0 && (
              <div className="selected-items">
                <h3>Selected Items</h3>
                <ul className="meal-items-list">
                  {mealPlan.selectedItems.map((item, index) => (
                    <li key={index} className="meal-item">
                      <span className="item-name">{item.name}</span>
                      {item.servings > 1 && <span className="item-servings">× {item.servings}</span>}
                      <div className="item-details">
                        <span>Calories: {Math.round(item.calories)}</span>
                        <span>Protein: {Math.round(item.protein)}g</span>
                        <span>{item.category}</span>
                        {item.station && <span>{item.station}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {mealPlan.totals && (
              <div className="nutritional-totals">
                <h3>Nutritional Totals</h3>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-value">{Math.round(mealPlan.totals.calories)}</span>
                    <span className="total-label">Calories</span>
                  </div>
                  <div className="total-item">
                    <span className="total-value">{Math.round(mealPlan.totals.protein)}g</span>
                    <span className="total-label">Protein</span>
                  </div>
                  <div className="total-item">
                    <span className="total-value">{Math.round(mealPlan.totals.fat)}g</span>
                    <span className="total-label">Fat</span>
                  </div>
                  <div className="total-item">
                    <span className="total-value">{Math.round(mealPlan.totals.sugar)}g</span>
                    <span className="total-label">Sugar</span>
                  </div>
                </div>
              </div>
            )}
            
            {mealPlan.warnings && mealPlan.warnings.length > 0 && (
              <div className="plan-warnings">
                <h3>Notes</h3>
                <ul>
                  {mealPlan.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {mealPlan.message && (
              <p className="algorithm-message">{mealPlan.message}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default MealPlannerPage;