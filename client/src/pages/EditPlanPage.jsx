import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditPlanPage.css';

function EditPlanPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mealPlan, setMealPlan] = useState({
    id: 'mp-123456',
    name: 'My Lunch Plan',
    diningHall: 'De Neve',
    mealTime: 'lunch',
    items: []
  });
  
  // Load meal plan data
  useEffect(() => {
    setTimeout(() => {
      // Replace later
      setMealPlan({
        id: 'mp-123456',
        name: 'My Lunch Plan',
        diningHall: 'De Neve',
        mealTime: 'lunch',
        items: [
          { id: 1, name: 'Grilled Chicken Breast', servings: 2, calories: 300, protein: 50, fat: 10, sugar: 0 },
          { id: 2, name: 'Steamed Broccoli', servings: 1, calories: 55, protein: 3, fat: 0, sugar: 2 },
          { id: 3, name: 'Brown Rice', servings: 1, calories: 215, protein: 5, fat: 2, sugar: 0 },
          { id: 4, name: 'Greek Yogurt', servings: 1, calories: 130, protein: 12, fat: 4, sugar: 6 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  // Calculate nutritional totals
  const calculateTotals = () => {
    return mealPlan.items.reduce((acc, item) => {
      acc.calories += item.calories * item.servings;
      acc.protein += item.protein * item.servings;
      acc.fat += item.fat * item.servings;
      acc.sugar += item.sugar * item.servings;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, sugar: 0 });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') return;
    
    // Replace later
    setTimeout(() => {
      // Mock results
      const results = [
        { id: 5, name: 'Grilled Salmon', calories: 180, protein: 22, fat: 8, sugar: 0 },
        { id: 6, name: 'Garden Salad', calories: 70, protein: 2, fat: 1, sugar: 3 },
        { id: 7, name: 'Quinoa', calories: 120, protein: 4, fat: 2, sugar: 1 },
        { id: 8, name: 'Fruit Cup', calories: 80, protein: 1, fat: 0, sugar: 18 }
      ];
      
      setSearchResults(results);
    }, 500);
  };
  
  const handleAddItem = (item) => {
    const existingItemIndex = mealPlan.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...mealPlan.items];
      updatedItems[existingItemIndex].servings += 1;
      setMealPlan({ ...mealPlan, items: updatedItems });
    } else {
      setMealPlan({
        ...mealPlan,
        items: [...mealPlan.items, { ...item, servings: 1 }]
      });
    }
    
    setSearchResults([]);
    setSearchTerm('');
  };
  
  const handleRemoveItem = (itemId) => {
    setMealPlan({
      ...mealPlan,
      items: mealPlan.items.filter(item => item.id !== itemId)
    });
  };
  
  const handleChangeServings = (itemId, change) => {
    const updatedItems = mealPlan.items.map(item => {
      if (item.id === itemId) {
        const newServings = Math.max(1, item.servings + change);
        return { ...item, servings: newServings };
      }
      return item;
    });
    
    setMealPlan({ ...mealPlan, items: updatedItems });
  };
  
  const handleSavePlan = () => {
    setSaving(true);
    
    // Replace later
    setTimeout(() => {
      setSaving(false);
      navigate('/');
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="edit-plan-page">
        <div className="edit-plan-loading">
          <p>Loading meal plan...</p>
        </div>
      </div>
    );
  }
  
  const totals = calculateTotals();
  
  return (
    <div className="edit-plan-page">
      <div className="edit-plan-header">
        <h2>Edit Your Meal Plan</h2>
        <p>Make manual adjustments to your meal selections</p>
      </div>
      
      <div className="edit-plan-content">
        <div className="edit-plan-details">
          <div className="plan-info">
            <div className="plan-name">
              <label htmlFor="plan-name">Plan Name</label>
              <input 
                type="text" 
                id="plan-name" 
                value={mealPlan.name} 
                onChange={(e) => setMealPlan({ ...mealPlan, name: e.target.value })} 
              />
            </div>
            
            <div className="plan-meta">
              <div className="meta-item">
                <label htmlFor="dining-hall">Dining Hall</label>
                <select 
                  id="dining-hall" 
                  value={mealPlan.diningHall} 
                  onChange={(e) => setMealPlan({ ...mealPlan, diningHall: e.target.value })}
                >
                  <option value="De Neve">De Neve</option>
                  <option value="Epicuria">Epicuria</option>
                  <option value="Bruin Plate">Bruin Plate</option>
                  <option value="FEAST at Rieber">FEAST</option>
                </select>
              </div>
              
              <div className="meta-item">
                <label htmlFor="meal-time">Meal Time</label>
                <select 
                  id="meal-time" 
                  value={mealPlan.mealTime} 
                  onChange={(e) => setMealPlan({ ...mealPlan, mealTime: e.target.value })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="nutrition-summary">
            <h3>Nutritional Summary</h3>
            <div className="nutrition-values">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">{totals.calories}</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">{totals.protein}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fat</span>
                <span className="nutrition-value">{totals.fat}g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Sugar</span>
                <span className="nutrition-value">{totals.sugar}g</span>
              </div>
            </div>
          </div>
          
          <div className="meal-items">
            <h3>Meal Items</h3>
            {mealPlan.items.length === 0 ? (
              <p className="empty-items">No items added yet. Add items using the search below.</p>
            ) : (
              <ul className="items-list">
                {mealPlan.items.map(item => (
                  <li key={item.id} className="item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-nutrition">
                        {item.calories * item.servings} cal • {item.protein * item.servings}g protein
                      </span>
                    </div>
                    
                    <div className="item-actions">
                      <div className="servings-control">
                        <button onClick={() => handleChangeServings(item.id, -1)}>-</button>
                        <span>{item.servings}</span>
                        <button onClick={() => handleChangeServings(item.id, 1)}>+</button>
                      </div>
                      <button 
                        className="remove-button" 
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="edit-plan-search">
          <h3>Add Items</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results</h4>
              <ul>
                {searchResults.map(item => (
                  <li key={item.id} className="result-item">
                    <div className="result-info">
                      <span className="result-name">{item.name}</span>
                      <span className="result-nutrition">
                        {item.calories} cal • {item.protein}g protein
                      </span>
                    </div>
                    <button onClick={() => handleAddItem(item)}>Add</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="actions">
            <button 
              className="save-button" 
              onClick={handleSavePlan}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Meal Plan'}
            </button>
            <button 
              className="cancel-button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPlanPage; 