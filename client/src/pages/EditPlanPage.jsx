import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { apiService } from '../services/api';
import './EditPlanPage.css';

// Dining halls configuration
const DINING_HALLS = [
  'De Neve Dining',
  'Epicuria at Covel', 
  'Bruin Plate',
  'Spice Kitchen at Feast'
];

const MEAL_PERIODS = ['breakfast', 'lunch', 'dinner'];

function EditPlanPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  // Core state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // User's meal plans for selection
  const [userMealPlans, setUserMealPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(id || '');
  const [showPlanSelector, setShowPlanSelector] = useState(!id);
  
  // Meal plan state
  const [mealPlan, setMealPlan] = useState({
    name: '',
    date: '2025-05-30', // Use a specific date that likely has menu data
    mealTime: 'lunch',
    diningHall: '',
    items: []
  });
  
  // Menu sidebar state
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedDiningHall, setSelectedDiningHall] = useState('De Neve Dining');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOverPlan, setIsDragOverPlan] = useState(false);

  // Load user's meal plans on component mount
  useEffect(() => {
    const loadUserMealPlans = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.mealPlans.getUserPlans();
        const plans = response.plans || [];
        setUserMealPlans(plans);
        
        if (id) {
          const plan = plans.find(p => p._id === id);
          if (plan) {
            setMealPlan({
              name: plan.name,
              date: plan.date.split('T')[0],
              mealTime: plan.mealTime,
              diningHall: plan.diningHall || '',
              items: plan.items || []
            });
            setSelectedDiningHall(plan.diningHall || 'De Neve Dining');
            setShowPlanSelector(false);
          } else {
            setError('Meal plan not found');
          }
        }
      } catch (error) {
        console.error('Error loading user meal plans:', error);
        setError('Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };

    loadUserMealPlans();
  }, [user, id]);

  // Load menu items when dining hall, date, or meal time changes
  useEffect(() => {
    if (!showPlanSelector && selectedDiningHall) {
      loadMenuItems();
    }
  }, [selectedDiningHall, mealPlan.date, mealPlan.mealTime, showPlanSelector]);

  // Load menu items from API
  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const params = {
        date: mealPlan.date,
        meal_period: mealPlan.mealTime,
        dining_hall: selectedDiningHall
      };

      const response = await apiService.menu.getAll(params);
      
      let items = response.items || response || [];
      
      // If no items found with date filter, try without date
      if (items.length === 0) {
        const fallbackParams = {
          meal_period: mealPlan.mealTime,
          dining_hall: selectedDiningHall
        };
        const fallbackResponse = await apiService.menu.getAll(fallbackParams);
        items = fallbackResponse.items || fallbackResponse || [];
      }
      
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Filter and group menu items by station
  const groupedMenuItems = useMemo(() => {
    let items = menuItems;
    
    // Apply search filter
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.station?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Group by station
    const grouped = items.reduce((acc, item) => {
      const station = item.station || 'Other';
      if (!acc[station]) {
        acc[station] = [];
      }
      acc[station].push(item);
      return acc;
    }, {});
    
    // Sort stations alphabetically and sort items within each station
    const sortedStations = Object.keys(grouped).sort();
    const result = {};
    sortedStations.forEach(station => {
      result[station] = grouped[station].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return result;
  }, [menuItems, searchQuery]);

  // Load selected meal plan
  const handlePlanSelection = async (planId) => {
    if (!planId) return;
    
    try {
      setLoading(true);
      const plan = await apiService.mealPlans.getById(planId);
      
      // Saved meal plan items now have correct total values, no conversion needed
      const convertedItems = plan.items || [];
      
      setMealPlan({
        name: plan.name,
        date: plan.date.split('T')[0],
        mealTime: plan.mealTime,
        diningHall: plan.diningHall || '',
        items: convertedItems
      });
      setSelectedDiningHall(plan.diningHall || 'De Neve Dining');
      setSelectedPlanId(planId);
      setShowPlanSelector(false);
      setError(null);
    } catch (error) {
      console.error('Error loading meal plan:', error);
      setError('Failed to load selected meal plan');
    } finally {
      setLoading(false);
    }
  };

  // Calculate nutritional totals
  const nutritionTotals = useMemo(() => {
    return mealPlan.items.reduce((acc, item) => {
      // Item values are now total values (already include servings), don't multiply again
      acc.calories += item.calories || 0;
      acc.protein += item.protein || 0;
      acc.sugar += item.sugar || 0;
      acc.fat += item.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, sugar: 0, fat: 0 });
  }, [mealPlan.items]);

  // Drag and Drop Handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.target.style.opacity = '0.7';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setIsDragOverPlan(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverPlan(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOverPlan(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOverPlan(false);
    
    try {
      const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
      addItemToPlan(itemData);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Add item to meal plan
  const addItemToPlan = (item) => {
    const existingItemIndex = mealPlan.items.findIndex(
      planItem => planItem.name === item.name && planItem.dining_hall === item.dining_hall
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...mealPlan.items];
      const existingItem = updatedItems[existingItemIndex];
      const currentServings = existingItem.servings || 1;
      const newServings = currentServings + 1;
      
      // Calculate per-serving values from existing totals, then add one more serving
      const perServingCalories = existingItem.calories / currentServings;
      const perServingProtein = existingItem.protein / currentServings;
      const perServingSugar = existingItem.sugar / currentServings;
      const perServingFat = existingItem.fat / currentServings;
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        servings: newServings,
        calories: perServingCalories * newServings,
        protein: perServingProtein * newServings,
        sugar: perServingSugar * newServings,
        fat: perServingFat * newServings,
      };
      
      setMealPlan(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Transform the item to match the meal plan schema (store as total values)
      const perServingCalories = item.calories || item.nutrition?.calories || 0;
      const perServingProtein = item.protein || item.nutrition?.protein || 0;
      const perServingSugar = item.sugar || item.nutrition?.sugar || 0;
      const perServingFat = item.fat || item.nutrition?.fat || 0;
      
      const newItem = {
        ...item,
        servings: 1,
        // Store as total values (1 serving initially)
        calories: perServingCalories,
        protein: perServingProtein,
        sugar: perServingSugar,
        fat: perServingFat,
        carbs: item.carbs || item.nutrition?.carbs || 0,
        fiber: item.fiber || item.nutrition?.fiber || 0,
        sodium: item.sodium || item.nutrition?.sodium || 0,
      };
      
      // Remove the nested nutrition object if it exists
      delete newItem.nutrition;
      
      setMealPlan(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  // Remove item from plan
  const removeItemFromPlan = (index) => {
    setMealPlan(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Update item servings
  const updateItemServings = (index, newServings) => {
    if (newServings < 1) return;
    const updatedItems = [...mealPlan.items];
    const item = updatedItems[index];
    const currentServings = item.servings || 1;
    
   
    const perServingCalories = item.calories / currentServings;
    const perServingProtein = item.protein / currentServings;
    const perServingSugar = item.sugar / currentServings;
    const perServingFat = item.fat / currentServings;
    
    
    updatedItems[index] = {
      ...item,
      servings: newServings,
      calories: perServingCalories * newServings,
      protein: perServingProtein * newServings,
      sugar: perServingSugar * newServings,
      fat: perServingFat * newServings,
    };
    
    setMealPlan(prev => ({ ...prev, items: updatedItems }));
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
        diningHall: selectedDiningHall,
        preferences: {
          targetCalories: nutritionTotals.calories,
          minProtein: nutritionTotals.protein,
          diningHall: selectedDiningHall,
          mealTime: mealPlan.mealTime
        },
        isGenerated: false,
        isCustomized: true
      };

      if (selectedPlanId) {
        await apiService.mealPlans.update(selectedPlanId, planData);
      } else {
        await apiService.mealPlans.create(planData);
      }

      navigate('/my-plans');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      setError(error.message || 'Failed to save meal plan');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loading, error, mealPlan.items]);

  if (loading) {
    return (
      <div className="edit-plan-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  // Show meal plan selector if no plan is selected
  if (showPlanSelector) {
    return (
      <div className="edit-plan-page">
        <header className="page-header">
          <div className="header-content">
            <button className="back-button" onClick={() => navigate('/my-plans')}>
              ← Back
            </button>
            <div className="title-section">
              <h1>Select Meal Plan to Edit</h1>
              <p>Choose which meal plan you'd like to modify</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <span className="error-text">{error}</span>
            <button className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="plan-selector-content">
          {userMealPlans.length === 0 ? (
            <div className="no-plans">
              <div className="empty-icon">🍽️</div>
              <h3>No Meal Plans Found</h3>
              <p>You haven't created any meal plans yet. Create one first from the preferences page.</p>
              <button className="create-button" onClick={() => navigate('/preferences')}>
                Create Meal Plan
              </button>
            </div>
          ) : (
            <div className="plans-grid">
              {userMealPlans.map(plan => (
                <div key={plan._id} className="plan-card" onClick={() => handlePlanSelection(plan._id)}>
                  <h3>{plan.name}</h3>
                  <div className="plan-details">
                    <p><strong>Date:</strong> {new Date(plan.date).toLocaleDateString()}</p>
                    <p><strong>Meal:</strong> {plan.mealTime}</p>
                    <p><strong>Items:</strong> {plan.items?.length || 0} items</p>
                    {plan.diningHall && <p><strong>Dining Hall:</strong> {plan.diningHall}</p>}
                  </div>
                  <button className="edit-button">Edit This Plan</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show meal plan editor
  return (
    <div className="edit-plan-page">
      <header className="page-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/my-plans')}>
            ← Back to My Plans
          </button>
          <div className="title-section">
            <h1>Edit Meal Plan</h1>
            <p>Drag items from the menu or click + to add them</p>
          </div>
        </div>
        <button 
          className={`save-button ${saving ? 'saving' : ''}`}
          onClick={handleSavePlan}
          disabled={saving || mealPlan.items.length === 0 || !mealPlan.name.trim()}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="page-content">
        {/* Compact Menu Sidebar */}
        <aside className="menu-sidebar">
          <div className="sidebar-header">
            <h3>Menu Items</h3>
            <div className="dining-hall-selector">
              <select 
                value={selectedDiningHall}
                onChange={(e) => setSelectedDiningHall(e.target.value)}
                className="dining-hall-dropdown"
              >
                {DINING_HALLS.map(hall => (
                  <option key={hall} value={hall}>{hall}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="menu-items-scroll">
            {loadingMenu ? (
              <div className="loading-menu">
                <div className="loading-spinner"></div>
                <p>Loading menu...</p>
              </div>
            ) : Object.keys(groupedMenuItems).length === 0 ? (
              <div className="no-menu-items">
                <p>No items found</p>
              </div>
            ) : (
              <div className="menu-items-list">
                {Object.entries(groupedMenuItems).map(([station, items]) => (
                  <div key={station} className="menu-item-group">
                    <h4>{station}</h4>
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="menu-item-compact"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="item-info">
                          <h5>{item.name}</h5>
                          <p className="item-location">{item.station}</p>
                          <div className="item-nutrition">
                            <span>{item.nutrition?.calories || 0} cal</span>
                            <span>{item.nutrition?.protein || 0}g protein</span>
                          </div>
                        </div>
                        <button 
                          className="add-item-btn"
                          onClick={() => addItemToPlan(item)}
                          title="Add to meal plan"
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Plan Details Form */}
          <section className="plan-details-card">
            <h3>Plan Details</h3>
            <div className="details-form">
              <div className="form-group">
                <label>Plan Name</label>
                <input 
                  type="text" 
                  value={mealPlan.name}
                  onChange={(e) => setMealPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date"
                    value={mealPlan.date}
                    onChange={(e) => setMealPlan(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Meal Time</label>
                  <select 
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
              </div>
            </div>
          </section>

          {/* Nutrition Summary */}
          <section className="nutrition-card">
            <h3>Nutrition Summary</h3>
            <div className="nutrition-stats">
              <div className="stat">
                <span className="value">{Math.round(nutritionTotals.calories)}</span>
                <span className="label">Calories</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(nutritionTotals.protein)}g</span>
                <span className="label">Protein</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(nutritionTotals.sugar)}g</span>
                <span className="label">Sugar</span>
              </div>
              <div className="stat">
                <span className="value">{Math.round(nutritionTotals.fat)}g</span>
                <span className="label">Fat</span>
              </div>
            </div>
          </section>

          {/* Meal Plan Drop Zone */}
          <section 
            className={`meal-plan-card ${isDragOverPlan ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="card-header">
              <h3>Your Meal Plan</h3>
              <span className="item-count">{mealPlan.items.length} items</span>
            </div>

            {mealPlan.items.length === 0 ? (
              <div className="empty-drop-zone">
                <div className="drop-message">
                  <span className="drop-icon">🍽️</span>
                  <h4>Drop items here or use the + button</h4>
                  <p>Drag items from the sidebar to build your meal plan</p>
                </div>
              </div>
            ) : (
              <div className="plan-items-list">
                {mealPlan.items.map((item, index) => (
                  <div key={index} className="plan-item">
                    <div className="item-content">
                      <h4>{item.name}</h4>
                      <p>{item.dining_hall} • {item.station}</p>
                      <div className="item-stats">
                        {Math.round(item.calories || 0)} cal • 
                        {Math.round(item.protein || 0)}g protein
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <div className="serving-control">
                        <button 
                          onClick={() => updateItemServings(index, item.servings - 1)}
                          disabled={item.servings <= 1}
                        >
                          −
                        </button>
                        <span>{item.servings}</span>
                        <button 
                          onClick={() => updateItemServings(index, item.servings + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeItemFromPlan(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default EditPlanPage;