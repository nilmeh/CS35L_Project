import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/PreferencesForm';
import './PreferencesPage.css';

function PreferencesPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmitPreferences = async (preferences) => {
    setLoading(true);
    
    try {
      // Replace later
      console.log('Submitted preferences:', preferences);
      
      setTimeout(() => {
        setLoading(false);
        
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setLoading(false);
    }
  };
  
  return (
    <div className="preferences-page">
      <div className="preferences-header">
        <h2>Set Your Meal Preferences</h2>
        <p>Customize your nutritional goals and dietary preferences</p>
      </div>
      
      <div className="preferences-container">
        {loading ? (
          <div className="preferences-loading">
            <p>Generating your meal plan...</p>
          </div>
        ) : (
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
              <PreferencesForm onSubmit={handleSubmitPreferences} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PreferencesPage; 