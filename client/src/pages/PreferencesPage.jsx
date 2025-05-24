import { useState } from 'react';
import axios from 'axios';
import PreferencesForm from '../components/PreferencesForm'; // Make sure this path is correct


function PreferencesPage() {
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async (preferences) => {
    setLoading(true); 
    setError('');
    setMealPlan(null);

    try {
      console.log('Sending preferences to backend:', preferences);
      
      
      const response = await axios.post('http://localhost:3000/api/mealplans', preferences);
      
      console.log('Meal plan response:', response.data);
      setMealPlan(response.data);
      
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Could not generate a meal plan. Please try again.');
      setMealPlan(null);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="preferences-page" style={{ padding: '2rem' }}>
      
      
      <PreferencesForm onSubmit={handleGeneratePlan} />

      {loading && <p>Generating your meal plan, please wait...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {mealPlan && (
        <div className="results-display" style={{ marginTop: '2rem' }}>
          <h2>Your Generated Meal Plan!</h2>
          {
            
          }
          <pre>{JSON.stringify(mealPlan, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default PreferencesPage;