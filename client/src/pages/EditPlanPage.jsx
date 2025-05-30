import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { apiService, handleApiError } from '../services/api';
import './EditPlanPage.css';

// Dining halls configuration
const DINING_HALLS = [
  'De Neve',
  'Epicuria', 
  'Bruin Plate',
  'FEAST at Rieber'
];

const MEAL_PERIODS = ['breakfast', 'lunch', 'dinner'];

function EditPlanPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Create mode vs Edit mode
  const isCreateMode = !id;
  const initialData = searchParams.get('data');
  
  // Core state
  const [loading, setLoading] = useState(!isCreateMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Meal plan state
  const [mealPlan, setMealPlan] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    mealTime: 'lunch',
    diningHall: '',
    items: []
  });
  
  // Search and editing state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    diningHall: '',
    category: '',
    vegetarian: false,
    vegan: false
  });
  
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  
  // Available dates for meal planning
  const [availableDates, setAvailableDates] = useState([]);

  // Load available dates
  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        const dates = await apiService.menu.getAvailableDates();
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error loading available dates:', error);
      }
    };
    loadAvailableDates();
  }, []);

  // Load meal plan if editing
  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
      
      // Initialize with data from URL params if creating from generated plan
      if (initialData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(initialData));
          setMealPlan(prev => ({
            ...prev,
            ...parsedData,
            name: parsedData.name || `${parsedData.mealTime || 'Meal'} Plan`
          }));
        } catch (error) {
          console.error('Error parsing initial data:', error);
        }
      }
      return;
    }

    const loadMealPlan = async () => {
      try {
        setLoading(true);
        const plan = await apiService.mealPlans.getById(id);
        setMealPlan({
          name: plan.name,
          date: plan.date.split('T')[0], // Convert to YYYY-MM-DD format
          mealTime: plan.mealTime,
          diningHall: plan.diningHall || '',
          items: plan.items || []
        });
      } catch (error) {
        console.error('Error loading meal plan:', error);
        setError('Failed to load meal plan');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadMealPlan();
    }
  }, [id, isCreateMode, initialData, user]);

  // Search menu items
  const searchMenuItems = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const params = {
        search: searchTerm,
        date: mealPlan.date,
        ...searchFilters,
        limit: 20
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] && params[key] !== false) {
          delete params[key];
        }
      });

      const results = await apiService.mealPlans.searchMenuItems(params);
      setSearchResults(results.items || []);
    } catch (error) {
      console.error('Error searching menu items:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, mealPlan.date, searchFilters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMenuItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchMenuItems]);

  // Calculate nutritional totals
  const nutritionTotals = useMemo(() => {
    return mealPlan.items.reduce((acc, item) => {
      const servings = item.servings || 1;
      acc.calories += (item.calories || 0) * servings;
      acc.protein += (item.protein || 0) * servings;
      acc.sugar += (item.sugar || 0) * servings;
      acc.fat += (item.fat || 0) * servings;
      acc.carbs += (item.carbs || 0) * servings;
      acc.fiber += (item.fiber || 0) * servings;
      acc.sodium += (item.sodium || 0) * servings;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      sugar: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sodium: 0
    });
  }, [mealPlan.items]);

  // Add item to meal plan
  const addItemToPlan = (item) => {
    const existingItemIndex = mealPlan.items.findIndex(
      planItem => planItem.name === item.name && planItem.dining_hall === item.dining_hall
    );

    if (existingItemIndex >= 0) {
      // Increase servings if item already exists
      const updatedItems = [...mealPlan.items];
      updatedItems[existingItemIndex].servings = (updatedItems[existingItemIndex].servings || 1) + 1;
      setMealPlan(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem = {
        ...item,
        servings: 1,
        carbs: item.carbs || 0,
        fiber: item.fiber || 0,
        sodium: item.sodium || 0
      };
      setMealPlan(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    // Clear search after adding
    setSearchTerm('');
    setSearchResults([]);
  };

  // Remove item from plan
  const removeItemFromPlan = (index) => {
    setMealPlan(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item servings
  const updateItemServings = (index, change) => {
    const updatedItems = [...mealPlan.items];
    const newServings = Math.max(1, (updatedItems[index].servings || 1) + change);
    updatedItems[index].servings = newServings;
    setMealPlan(prev => ({ ...prev, items: updatedItems }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, item, source, index) => {
    setDraggedItem({ item, source, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, target) => {
    e.preventDefault();
    setDragOver(target);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(null);
    }
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setDragOver(null);

    if (!draggedItem) return;

    if (draggedItem.source === 'search' && target === 'plan') {
      addItemToPlan(draggedItem.item);
    } else if (draggedItem.source === 'plan' && target === 'remove') {
      removeItemFromPlan(draggedItem.index);
    }

    setDraggedItem(null);
  };

  // Save meal plan
  const handleSavePlan = async () => {
    if (!user) {
      setError('Please log in to save meal plans');
      return;
    }

    if (!mealPlan.name.trim()) {
      setError('Please enter a name for your meal plan');
      return;
    }

    if (mealPlan.items.length === 0) {
      setError('Please add at least one item to your meal plan');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const planData = {
        ...mealPlan,
        preferences: {
          targetCalories: nutritionTotals.calories,
          minProtein: nutritionTotals.protein,
          diningHall: mealPlan.diningHall,
          mealTime: mealPlan.mealTime
        },
        isGenerated: false,
        isCustomized: true
      };

      if (isCreateMode) {
        await apiService.mealPlans.create(planData);
      } else {
        await apiService.mealPlans.update(id, planData);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      setError(error.message || 'Failed to save meal plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-plan-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-plan-page">
      <div className="edit-plan-header">
        <div className="header-content">
          <h1>{isCreateMode ? 'Create New Meal Plan' : 'Edit Meal Plan'}</h1>
          <p>Drag and drop items to customize your perfect meal</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="save-button"
            onClick={handleSavePlan}
            disabled={saving || mealPlan.items.length === 0}
          >
            {saving ? '⏳ Saving...' : '💾 Save Plan'}
          </button>
          <button 
            className="cancel-button"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="edit-plan-content">
        {/* Meal Plan Configuration */}
        <div className="plan-config-section">
          <div className="config-card">
            <h3>📋 Plan Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plan-name">Plan Name</label>
                <input 
                  type="text" 
                  id="plan-name" 
                  value={mealPlan.name}
                  onChange={(e) => setMealPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <select 
                  id="date" 
                  value={mealPlan.date}
                  onChange={(e) => setMealPlan(prev => ({ ...prev, date: e.target.value }))}
                >
                  {availableDates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="meal-time">Meal Time</label>
                <select 
                  id="meal-time" 
                  value={mealPlan.mealTime}
                  onChange={(e) => setMealPlan(prev => ({ ...prev, mealTime: e.target.value }))}
                >
                  {MEAL_PERIODS.map(period => (
                    <option key={period} value={period}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dining-hall">Dining Hall</label>
                <select 
                  id="dining-hall" 
                  value={mealPlan.diningHall}
                  onChange={(e) => setMealPlan(prev => ({ ...prev, diningHall: e.target.value }))}
                >
                  <option value="">Any dining hall</option>
                  {DINING_HALLS.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Nutrition Summary */}
          <div className="nutrition-card">
            <h3>📊 Nutrition Summary</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">{Math.round(nutritionTotals.calories)}</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">{Math.round(nutritionTotals.protein)}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Sugar</span>
                <span className="nutrition-value">{Math.round(nutritionTotals.sugar)}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fat</span>
                <span className="nutrition-value">{Math.round(nutritionTotals.fat)}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="edit-main-content">
          {/* Current Meal Plan */}
          <div className="current-plan-section">
            <div className="section-header">
              <h3>🍽️ Your Meal Plan</h3>
              <span className="item-count">{mealPlan.items.length} items</span>
            </div>

            <div 
              className={`meal-plan-drop-zone ${dragOver === 'plan' ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, 'plan')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'plan')}
            >
              {mealPlan.items.length === 0 ? (
                <div className="empty-plan">
                  <div className="empty-icon">🍽️</div>
                  <p>Your meal plan is empty</p>
                  <span>Drag items here or use the search below</span>
                </div>
              ) : (
                <div className="plan-items-list">
                  {mealPlan.items.map((item, index) => (
                    <div 
                      key={index} 
                      className="plan-item-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, 'plan', index)}
                    >
                      <div className="item-info">
                        <h4 className="item-name">{item.name}</h4>
                        <div className="item-location">
                          <span>{item.dining_hall}</span>
                          {item.station && <span> • {item.station}</span>}
                        </div>
                        <div className="item-nutrition">
                          {Math.round(item.calories * (item.servings || 1))} cal • 
                          {Math.round(item.protein * (item.servings || 1))}g protein
                        </div>
                      </div>

                      <div className="item-controls">
                        <div className="servings-control">
                          <button 
                            onClick={() => updateItemServings(index, -1)}
                            disabled={(item.servings || 1) <= 1}
                          >
                            −
                          </button>
                          <span>{item.servings || 1}</span>
                          <button onClick={() => updateItemServings(index, 1)}>+</button>
                        </div>
                        
                        <button 
                          className="remove-button"
                          onClick={() => removeItemFromPlan(index)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remove Drop Zone */}
            <div 
              className={`remove-drop-zone ${dragOver === 'remove' ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, 'remove')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'remove')}
            >
              <span className="remove-icon">🗑️</span>
              <span>Drop here to remove</span>
            </div>
          </div>

          {/* Search and Add Items */}
          <div className="search-section">
            <div className="section-header">
              <h3>🔍 Add Items</h3>
            </div>

            {/* Search Filters */}
            <div className="search-filters">
              <div className="filter-row">
                <select 
                  value={searchFilters.diningHall}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, diningHall: e.target.value }))}
                >
                  <option value="">All dining halls</option>
                  {DINING_HALLS.map(hall => (
                    <option key={hall} value={hall}>{hall}</option>
                  ))}
                </select>

                <select 
                  value={searchFilters.category}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All categories</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Side">Side</option>
                  <option value="Soup">Soup</option>
                  <option value="Salad">Salad</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>

                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={searchFilters.vegetarian}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, vegetarian: e.target.checked }))}
                  />
                  Vegetarian
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={searchFilters.vegan}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, vegan: e.target.checked }))}
                  />
                  Vegan
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searching && <div className="search-spinner">⏳</div>}
            </div>

            {/* Search Results */}
            <div className="search-results">
              {searchResults.length > 0 ? (
                <div className="results-list">
                  {searchResults.map((item, index) => (
                    <div 
                      key={index} 
                      className="search-result-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, 'search', index)}
                      onClick={() => addItemToPlan(item)}
                    >
                      <div className="result-info">
                        <h4 className="result-name">{item.name}</h4>
                        <div className="result-location">
                          <span>{item.dining_hall}</span>
                          {item.station && <span> • {item.station}</span>}
                        </div>
                        <div className="result-nutrition">
                          {Math.round(item.calories)} cal • {Math.round(item.protein)}g protein
                        </div>
                      </div>
                      
                      <button className="add-button">
                        <span>+</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchTerm && !searching ? (
                <div className="no-results">
                  <p>No items found for "{searchTerm}"</p>
                  <span>Try adjusting your search or filters</span>
                </div>
              ) : (
                <div className="search-prompt">
                  <p>Search for food items to add to your meal plan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPlanPage; 