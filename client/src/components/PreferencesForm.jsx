import { useState, useEffect } from 'react';
import { DINING_HALLS, MEAL_PERIODS, apiService } from '../services/api';
import './PreferencesForm.css';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function PreferencesForm({ onSubmit, isLoading = false }) {
  const [availableDates, setAvailableDates] = useState([]);
  const [preferences, setPreferences] = useState({
    targetCalories: 1000,
    minProtein: 50,
    maxSugar: '',
    maxFat: '',
    vegetarian: false,
    vegan: false,
    allowedTags: [],
    disallowedTags: [],
    likedFoods: [],
    dislikedFoods: [],
    allergens: [],
    excludedCategories: [],
    diningHall: "",
    mealTime: "lunch",
    date: getTodayDateString() 
  });

  const [tagInputs, setTagInputs] = useState({
    allowedTags: '',
    disallowedTags: '',
    likedFoods: '',
    dislikedFoods: ''
  });

  const [errors, setErrors] = useState({});

  const commonAllergens = [
    'dairy', 'egg', 'fish', 'shellfish', 'tree nut', 'peanut', 'soy', 'wheat', 'sesame'
  ];

  const foodCategories = [
    { value: 'Soup', label: 'Soup', icon: '🍲' },
    { value: 'Dessert', label: 'Dessert', icon: '🍰' },
    { value: 'Beverage', label: 'Beverage', icon: '🥤' },
    { value: 'Side', label: 'Side Dishes', icon: '🥗' },
    { value: 'Salad', label: 'Salad', icon: '🥬' },
    { value: 'Appetizer', label: 'Appetizer', icon: '🥨' }
  ];

  useEffect(() => {
    const fetchAndSetAvailableDates = async () => {
      try {
        const response = await apiService.menu.getAvailableDates();
        const fetchedDates = response.dates || [];
        setAvailableDates(fetchedDates);
      } catch (error) {
        console.error('Error fetching available dates:', error);
      }
    };
    fetchAndSetAvailableDates();
  }, []); 

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    const parts = dateString.split('-');
    if (parts.length !== 3) return "Invalid Date Format";
    
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    
    const today = new Date();
    const todayFormatted = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');
    
    return todayFormatted === dateString;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!preferences.date) {
      newErrors.date = 'Please select a date for your meal plan';
    }
    if (preferences.targetCalories && (preferences.targetCalories < 300 || preferences.targetCalories > 5000)) {
      newErrors.targetCalories = 'Calories must be between 300 and 5000';
    }
    if (preferences.minProtein && (preferences.minProtein < 0 || preferences.minProtein > 300)) {
      newErrors.minProtein = 'Protein must be between 0 and 300g';
    }
    if (preferences.maxSugar !== '' && (preferences.maxSugar < 0 || preferences.maxSugar > 200)) {
      newErrors.maxSugar = 'Sugar must be between 0 and 200g';
    }
    if (preferences.maxFat !== '' && (preferences.maxFat < 0 || preferences.maxFat > 200)) {
      newErrors.maxFat = 'Fat must be between 0 and 200g';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' && value !== '' ? parseInt(value) : value)
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagChange = (e, listType) => {
    const inputValue = e.target.value;
    setTagInputs(prev => ({ ...prev, [listType]: inputValue }));
    const tags = inputValue.split(',').map(tag => tag.trim()).filter(Boolean);
    setPreferences(prev => ({ ...prev, [listType]: tags }));
  };

  const handleAllergenChange = (allergen) => {
    setPreferences(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const handleCategoryChange = (category) => {
    setPreferences(prev => ({
      ...prev,
      excludedCategories: prev.excludedCategories.includes(category)
        ? prev.excludedCategories.filter(c => c !== category)
        : [...prev.excludedCategories, category]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const submitData = {
      ...preferences,
      allowedTags: tagInputs.allowedTags.split(',').map(tag => tag.trim()).filter(Boolean),
      disallowedTags: tagInputs.disallowedTags.split(',').map(tag => tag.trim()).filter(Boolean),
      likedFoods: tagInputs.likedFoods.split(',').map(tag => tag.trim()).filter(Boolean),
      dislikedFoods: tagInputs.dislikedFoods.split(',').map(tag => tag.trim()).filter(Boolean),
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
            min="300" 
            max="5000" 
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
            max="300" 
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
        <div className="checkbox-group-container"> {/* Changed from checkbox-group to avoid nesting issues */}
          <div className="form-group checkbox-group-item"> {/* Changed class */}
            <input 
              type="checkbox" 
              id="vegetarian" 
              name="vegetarian" 
              checked={preferences.vegetarian} 
              onChange={handleChange} 
            />
            <label htmlFor="vegetarian">Vegetarian</label>
          </div>
          <div className="form-group checkbox-group-item"> {/* Changed class */}
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
      </div>

      <div className="form-section">
        <h3>🍽️ Food Preferences</h3>
        <p className="section-description">Tell us what you like and dislike - we'll prioritize your favorites and avoid your dislikes when possible</p>
        <div className="form-group">
          <label htmlFor="likedFoods">Foods You Enjoy (comma separated, optional):</label>
          <input 
            type="text" 
            id="likedFoods" 
            name="likedFoods" 
            placeholder="e.g. chicken, pasta, salads, fruits" 
            value={tagInputs.likedFoods} 
            onChange={(e) => handleTagChange(e, 'likedFoods')} 
          />
          <small className="help-text">💡 We'll prioritize meals with these ingredients when possible</small>
          {preferences.likedFoods.length > 0 && (
            <div className="preference-preview liked">
              <small>Preferred: {preferences.likedFoods.map(food => `"${food}"`).join(', ')}</small>
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="dislikedFoods">Foods You Avoid (comma separated, optional):</label>
          <input 
            type="text" 
            id="dislikedFoods" 
            name="dislikedFoods" 
            placeholder="e.g. spicy food, mushrooms, seafood" 
            value={tagInputs.dislikedFoods} 
            onChange={(e) => handleTagChange(e, 'dislikedFoods')} 
          />
          <small className="help-text">💡 We'll try to avoid meals with these ingredients</small>
          {preferences.dislikedFoods.length > 0 && (
            <div className="preference-preview disliked">
              <small>Avoiding: {preferences.dislikedFoods.map(food => `"${food}"`).join(', ')}</small>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>🚫 Food Categories to Exclude</h3>
        <p className="section-description">Select food categories you don't want in your meal plan</p>
        <div className="form-group">
          <div className="category-grid">
            {foodCategories.map(category => (
              <div key={category.value} className="checkbox-item category-item">
                <input
                  type="checkbox"
                  id={`category-${category.value}`}
                  checked={preferences.excludedCategories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                />
                <label htmlFor={`category-${category.value}`}>
                  {category.label} {category.icon}
                </label>
              </div>
            ))}
          </div>
          {preferences.excludedCategories.length > 0 && (
            <div className="exclusion-preview">
              <small>
                Excluding: {preferences.excludedCategories.map(cat => {
                  const categoryInfo = foodCategories.find(fc => fc.value === cat);
                  return categoryInfo ? `${categoryInfo.icon} ${categoryInfo.label}` : cat;
                }).join(', ')}
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>📅 Meal Scheduling & Dining Options</h3>
        <div className="form-group">
          <label htmlFor="date">Select Date:</label>
          <select 
            id="date" 
            name="date" 
            value={preferences.date} 
            onChange={handleChange}
            required
          >
            {/* Ensure today's date is an option, even if not in availableDates yet */}
            {!availableDates.includes(preferences.date) && preferences.date && (
                 <option key={preferences.date} value={preferences.date}>
                 {formatDate(preferences.date)} {isToday(preferences.date) && '(Today)'}
               </option>
            )}
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)} {isToday(date) && '(Today)'}
              </option>
            ))}
            {availableDates.length === 0 && !preferences.date && (
              <option value="" disabled>Loading available dates...</option>
            )}
          </select>
          {errors.date && <span className="error">{errors.date}</span>}
        </div>
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
  
      <button type="submit" className="generate-button" disabled={isLoading || !preferences.date}>
        {isLoading ? 'Generating...' : 
         preferences.date ? 
           `Generate Meal Plan for ${formatDate(preferences.date)}` : 
           'Select a Date to Generate Meal Plan'}
      </button>
    </form>
  );
}

export default PreferencesForm;
