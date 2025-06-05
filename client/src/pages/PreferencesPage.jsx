import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import PreferencesForm from '../components/PreferencesForm';
import MealPlanResults from '../components/MealPlanResults';
import { apiService, handleApiError } from '../services/api';
import './PreferencesPage.css';

function PreferencesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mealPlans, setMealPlans] = useState([]); // Array to store multiple meal plans
  const [currentPreferences, setCurrentPreferences] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mealPlans, loading, error]);
  
  const handleSubmitPreferences = async (preferences, regenerationType = 'default', variationSeed = null) => {
    setLoading(true);
    setError(null);
    
    if (regenerationType === 'default') {
      setCurrentPreferences(preferences);
    }
    
    try {
      const requestData = {
        ...preferences,
        regenerationType,
        variationSeed
      };
      
      const response = await apiService.mealPlans.generate(requestData);
      
      const newMealPlan = {
        id: Date.now(),
        mealPlan: response.mealPlan,
        preferences: preferences,
        variationInfo: response.mealPlan.variationInfo,
        timestamp: new Date()
      };
      
      if (regenerationType === 'default') {
        setMealPlans([newMealPlan]);
      } else {
        setMealPlans(prev => [...prev, newMealPlan]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleRegenerate = () => {
    if (!currentPreferences) {
      console.error('No current preferences to regenerate');
      return;
    }
    

    const variationSeed = Date.now() + Math.floor(Math.random() * 1000);
    
    handleSubmitPreferences(currentPreferences, 'regenerate', variationSeed);
  };
  
  const handleClearResults = () => {
    setMealPlans([]);
    setError(null);
    setCurrentPreferences(null);
  };
  

  
  return (
    <div className="preferences-page">
      <div className="preferences-header">
          <h2>Set Your Meal Preferences</h2>
          <p>Customize your nutritional goals and dietary preferences</p>
      </div>
      
      {/* Toast Notification */}
      {saveSuccess && (
        <div className={`toast-notification ${saveSuccess.type}`}>
          {saveSuccess.message}
        </div>
      )}
      
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
        
        {mealPlans.length > 0 && !loading && (
          <div className="meal-plans-section">
            <div className="meal-plans-header">
              <h3>🍽️ Your Meal Plan Options</h3>
              <div className="meal-plans-actions">
                <button onClick={handleRegenerate} className="regenerate-button" disabled={loading}>
                  🔄 Generate Another Option
                </button>
                <button onClick={handleClearResults} className="clear-button">
                  🗑️ Clear Results
                </button>
              </div>
            </div>
            
            <div className="meal-plans-grid">
              {mealPlans.map((planData, index) => (
                <div key={planData.id} className="meal-plan-option">
                  <div className="meal-plan-header">
                    <h4>Option {index + 1}</h4>
                    <div className="meal-plan-meta">
                      <span className="strategy-badge">
                        {planData.variationInfo?.strategy || 'balanced'}
                      </span>
                      <span className="timestamp">
                        {planData.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <MealPlanResults 
                    mealPlan={planData.mealPlan} 
                    compact={mealPlans.length > 1}
                    preferences={currentPreferences}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {mealPlans.length === 0 && !loading && !error && (
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
                <li>
                  <strong>Generate variations</strong>
                  <p>Don't like the first option? Generate alternative meal plans with different optimization strategies.</p>
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