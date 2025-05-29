import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import MealPlanResults from '../components/MealPlanResults';
import { apiService, handleApiError } from '../services/api';
import './PreferencesPage.css';

function PreferencesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmitPreferences = async (preferences) => {
    console.log('🎯 PreferencesPage: Starting meal plan generation...');
    console.log('📝 Form preferences received:', preferences);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('⏳ PreferencesPage: Calling API service...');
      
      const response = await apiService.mealPlans.generate(preferences);
      
      console.log('🎉 PreferencesPage: API call successful!');
      console.log('📊 Meal plan response:', response);
      
      setMealPlan(response.mealPlan);
      setLoading(false);
      
      console.log('✅ PreferencesPage: State updated successfully');
    } catch (error) {
      console.error('💥 PreferencesPage: Error occurred:', error);
      console.error('🔍 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = handleApiError(error);
      console.log('📝 Processed error message:', errorMessage);
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleRegenerate = () => {
    setMealPlan(null);
    setError(null);
  };
  
  const handleSavePlan = async (plan) => {
    try {
      // For now, just show a success message
      // Later this can be integrated with user authentication
      alert('Meal plan saved! (This feature will be fully implemented with user accounts)');
      console.log('Saving meal plan:', plan);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      alert('Error saving meal plan. Please try again.');
    }
  };
  
  return (
    <div className="preferences-page">
      <div className="preferences-header">
        <h2>Set Your Meal Preferences</h2>
        <p>Customize your nutritional goals and dietary preferences</p>
      </div>
      
      <div className="preferences-container">
        {loading && (
          <div className="preferences-loading">
            <div className="loading-spinner"></div>
            <p>Generating your personalized meal plan...</p>
            <p className="loading-subtext">Analyzing nutrition data and optimizing selections...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <h3>⚠️ Error Generating Meal Plan</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="retry-button">
              Try Again
            </button>
          </div>
        )}
        
        {mealPlan && !loading && (
          <div className="meal-plan-section">
            <MealPlanResults 
              mealPlan={mealPlan} 
              onRegenerate={handleRegenerate}
              onSave={handleSavePlan}
            />
          </div>
        )}
        
        {!mealPlan && !loading && !error && (
          <>
            <div className="preferences-info">
              <h3>How It Works</h3>
              <ol>
                <li>
                  <strong>Set your nutritional goals</strong>
                  <p>Tell us how many calories you want and set limits for protein, sugar, and fat.</p>
                </li>
                <li>
                  <strong>Choose your dietary preferences</strong>
                  <p>Select your dietary restrictions and foods you like or dislike.</p>
                </li>
                <li>
                  <strong>Select dining options</strong>
                  <p>Choose your preferred dining hall and meal time.</p>
                </li>
                <li>
                  <strong>Get personalized results</strong>
                  <p>Our algorithm will create an optimal meal plan based on available options.</p>
                </li>
              </ol>
            </div>
            
            <div className="preferences-form-container">
              <PreferencesForm 
                onSubmit={handleSubmitPreferences} 
                isLoading={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PreferencesPage; 