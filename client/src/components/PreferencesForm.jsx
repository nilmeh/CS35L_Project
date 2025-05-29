import { useState } from 'react';
import { DINING_HALLS, MEAL_PERIODS } from '../services/api';
import './PreferencesForm.css';

function PreferencesForm({ onSubmit, isLoading = false }) {
  const [preferences, setPreferences] = useState({
    targetCalories: 2000,
    minProtein: 50,
    maxSugar: '',
    maxFat: '',
    vegetarian: false,
    vegan: false,
    allowedTags: [],
    disallowedTags: [],
    allergens: [],
    diningHall: "",
    mealTime: "lunch"
  });

  const [errors, setErrors] = useState({});

  const commonAllergens = [
    'dairy', 'egg', 'fish', 'shellfish', 'tree nut', 'peanut', 'soy', 'wheat', 'sesame'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (preferences.targetCalories < 800 || preferences.targetCalories > 4000) {
      newErrors.targetCalories = 'Calories must be between 800 and 4000';
    }
    
    if (preferences.minProtein < 0 || preferences.minProtein > 200) {
      newErrors.minProtein = 'Protein must be between 0 and 200g';
    }
    
    if (preferences.maxSugar && (preferences.maxSugar < 0 || preferences.maxSugar > 200)) {
      newErrors.maxSugar = 'Sugar must be between 0 and 200g';
    }
    
    if (preferences.maxFat && (preferences.maxFat < 0 || preferences.maxFat > 200)) {
      newErrors.maxFat = 'Fat must be between 0 and 200g';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPreferences({
        ...preferences,
        [name]: checked
      });
    } else if (type === 'number') {
      setPreferences({
        ...preferences,
        [name]: value === '' ? '' : parseInt(value)
      });
    } else {
      setPreferences({
        ...preferences,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
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

  const handleAllergenChange = (allergen) => {
    const updatedAllergens = preferences.allergens.includes(allergen)
      ? preferences.allergens.filter(a => a !== allergen)
      : [...preferences.allergens, allergen];
    
    setPreferences({
      ...preferences,
      allergens: updatedAllergens
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert empty strings to undefined for optional fields
    const submitData = {
      ...preferences,
      maxSugar: preferences.maxSugar === '' ? undefined : preferences.maxSugar,
      maxFat: preferences.maxFat === '' ? undefined : preferences.maxFat,
    };
    
    onSubmit(submitData);
  };

    return (
    <form className="preferences-form" onSubmit={handleSubmit}>
      <h2>Customize Your Meal Plan</h2>
      
      <div className="form-section">
        <h3>Nutritional Goals</h3>
        
        <div className="form-group">
          <label htmlFor="targetCalories">Target Calories:</label>
          <input 
            type="number" 
            id="targetCalories" 
            name="targetCalories" 
            value={preferences.targetCalories} 
            onChange={handleChange}
            min="800" 
            max="4000" 
            required
          />
          {errors.targetCalories && <span className="error">{errors.targetCalories}</span>}
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
            max="200" 
            required
          />
          {errors.minProtein && <span className="error">{errors.minProtein}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="maxSugar">Maximum Sugar (g) (optional):</label>
          <input 
            type="number" 
            id="maxSugar" 
            name="maxSugar" 
            value={preferences.maxSugar} 
            onChange={handleChange}
            min="0" 
            max="200" 
            placeholder="Leave empty for no limit"
          />
          {errors.maxSugar && <span className="error">{errors.maxSugar}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="maxFat">Maximum Fat (g) (optional):</label>
          <input 
            type="number" 
            id="maxFat" 
            name="maxFat" 
            value={preferences.maxFat} 
            onChange={handleChange}
            min="0" 
            max="200" 
            placeholder="Leave empty for no limit"
          />
          {errors.maxFat && <span className="error">{errors.maxFat}</span>}
        </div>
      </div>
      
      <div className="form-section">
        <h3>Dietary Preferences</h3>
        
        <div className="checkbox-group">
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
          
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="vegan" 
              name="vegan" 
              checked={preferences.vegan} 
              onChange={handleChange} 
            />
            <label htmlFor="vegan">Vegan</label>
          </div>
        </div>
        
        <div className="form-group">
          <label>Allergens to Avoid:</label>
          <div className="allergen-grid">
            {commonAllergens.map(allergen => (
              <div key={allergen} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`allergen-${allergen}`}
                  checked={preferences.allergens.includes(allergen)}
                  onChange={() => handleAllergenChange(allergen)}
                />
                <label htmlFor={`allergen-${allergen}`}>
                  {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
        </label>
              </div>
            ))}
          </div>
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
            <option value="">Any dining hall</option>
            {DINING_HALLS.map(hall => (
              <option key={hall} value={hall}>{hall}</option>
            ))}
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
            {MEAL_PERIODS.map(period => (
              <option key={period} value={period}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      <button type="submit" className="generate-button" disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate Meal Plan'}
      </button>
      </form>
    );
  }
  
  export default PreferencesForm;
  