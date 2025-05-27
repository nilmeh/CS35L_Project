import { useState } from 'react';
import './PreferencesForm.css';

function PreferencesForm({ onSubmit }) {
  const [preferences, setPreferences] = useState({
    calories: 800,
    minProtein: 30,
    maxSugar: 50,
    maxFat: 40,
    vegetarian: false,
    allowedTags: [],
    disallowedTags: [],
    diningHall: "",
    mealTime: "lunch"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPreferences({
        ...preferences,
        [name]: checked
      });
    } else {
      setPreferences({
        ...preferences,
        [name]: value
      });
    }
  };

  const handleTagChange = (e, listType) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setPreferences({
      ...preferences,
      [listType]: tags
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  return (
    <form className="preferences-form" onSubmit={handleSubmit}>
      <h2>Customize Your Meal Plan</h2>
      
      <div className="form-section">
        <h3>Nutritional Goals</h3>
        
        <div className="form-group">
          <label htmlFor="calories">Target Calories:</label>
          <input 
            type="number" 
            id="calories" 
            name="calories" 
            value={preferences.calories} 
            onChange={handleChange}
            min="300" 
            max="2000" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="minProtein">Minimum Protein (g):</label>
          <input 
            type="number" 
            id="minProtein" 
            name="minProtein" 
            value={preferences.minProtein} 
            onChange={handleChange}
            min="0" 
            max="100" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maxSugar">Maximum Sugar (g):</label>
          <input 
            type="number" 
            id="maxSugar" 
            name="maxSugar" 
            value={preferences.maxSugar} 
            onChange={handleChange}
            min="0" 
            max="100" 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maxFat">Maximum Fat (g):</label>
          <input 
            type="number" 
            id="maxFat" 
            name="maxFat" 
            value={preferences.maxFat} 
            onChange={handleChange}
            min="0" 
            max="100" 
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Dietary Preferences</h3>
        
        <div className="form-group checkbox-group">
          <input 
            type="checkbox" 
            id="vegetarian" 
            name="vegetarian" 
            checked={preferences.vegetarian} 
            onChange={handleChange} 
          />
          <label htmlFor="vegetarian">Vegetarian</label>
        </div>
        
        <div className="form-group">
          <label htmlFor="allowedTags">Foods You Like (comma separated):</label>
          <input 
            type="text" 
            id="allowedTags" 
            name="allowedTags" 
            placeholder="e.g. chicken, rice, vegetables" 
            value={preferences.allowedTags.join(', ')} 
            onChange={(e) => handleTagChange(e, 'allowedTags')} 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="disallowedTags">Foods You Dislike (comma separated):</label>
          <input 
            type="text" 
            id="disallowedTags" 
            name="disallowedTags" 
            placeholder="e.g. mushrooms, seafood" 
            value={preferences.disallowedTags.join(', ')} 
            onChange={(e) => handleTagChange(e, 'disallowedTags')} 
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Dining Options</h3>
        
        <div className="form-group">
          <label htmlFor="diningHall">Preferred Dining Hall:</label>
          <select 
            id="diningHall" 
            name="diningHall" 
            value={preferences.diningHall} 
            onChange={handleChange}
          >
            <option value="">Select a dining hall</option>
            <option value="de neve dining">De Neve</option>
            <option value="epicuria">Epicuria</option>
            <option value="bruin plate">Bruin Plate</option>
            <option value="feast at rieber">FEAST</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="mealTime">Meal Time:</label>
          <select 
            id="mealTime" 
            name="mealTime" 
            value={preferences.mealTime} 
            onChange={handleChange}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>
      
      <button type="submit" className="generate-button">Generate Meal Plan</button>
    </form>
  );
}

export default PreferencesForm;
  