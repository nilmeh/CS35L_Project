import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { apiService, handleApiError } from '../services/api';
import './MealPlanResults.css';

function MealPlanResults({ mealPlan, onSave, compact = false, preferences = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  if (!mealPlan) {
    return null;
  }

  const { selectedItems, itemsByCategory, totals, warnings, message, variationInfo, selectedDiningHall } = mealPlan;

  const getCategoryIcon = (category) => {
    const icons = {
      'Main Course': '🍽️',
      'Side': '🥗',
      'Soup': '🍲',
      'Dessert': '🍰',
      'Beverage': '🥤',
      'Salad': '🥬',
      'Appetizer': '🥨'
    };
    return icons[category] || '🍴';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Main Course': '#4CAF50',
      'Side': '#FF9800',
      'Soup': '#2196F3',
      'Dessert': '#E91E63',
      'Beverage': '#9C27B0',
      'Salad': '#8BC34A',
      'Appetizer': '#FF5722'
    };
    return colors[category] || '#607D8B';
  };

  const getCategoryOrder = (category) => {
    const order = {
      'Main Course': 1,
      'Side': 2,
      'Soup': 3,
      'Salad': 4,
      'Appetizer': 5,
      'Dessert': 6,
      'Beverage': 7
    };
    return order[category] || 999; // Unknown categories go to the end
  };

  const sortedCategories = itemsByCategory 
    ? Object.entries(itemsByCategory).sort(([categoryA], [categoryB]) => 
        getCategoryOrder(categoryA) - getCategoryOrder(categoryB)
      )
    : [];

  const handleSavePlan = async () => {
    if (!user) {
      setSaveError('Please log in to save meal plans');
      return;
    }

    if (!preferences) {
      setSaveError('Missing preferences data');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const saveData = {
        mealPlan,
        preferences,
        name: `${preferences.mealTime || 'Meal'} Plan - ${new Date(preferences.date).toLocaleDateString()}`
      };

      await apiService.mealPlans.save(saveData);
      setSaved(true);
      
      if (onSave) {
        onSave(mealPlan);
      }

      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving meal plan:', error);
      
      if (error.message.includes('401') || error.message.includes('Authentication error')) {
        setSaveError('Your session has expired. Please log in again.');
      } else {
        setSaveError(error.message || 'Failed to save meal plan');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className={`meal-plan-results ${compact ? 'compact' : ''}`}>
      {/* Header Section */}
      {!compact && (
        <div className="results-header">
          <div className="header-content">
            <h2>🎯 Your Personalized Meal Plan</h2>
            <p className="header-subtitle">Optimized for your nutritional goals</p>
            {variationInfo && (
              <div className="variation-info">
                <span className="variation-strategy">Strategy: {variationInfo.strategy}</span>
              </div>
            )}
            {selectedDiningHall && (
              <div className="dining-hall-info">
                <span className="dining-hall-icon">🏛️</span>
                <span className="dining-hall-label">Dining Hall:</span>
                <span className="dining-hall-name">{selectedDiningHall}</span>
              </div>
            )}
          </div>
          
          {message && (
            <div className={`status-message ${warnings && warnings.length > 0 ? 'warning' : 'success'}`}>
              <span className="status-icon">
                {warnings && warnings.length > 0 ? '⚠️' : '✅'}
              </span>
              <span>{message}</span>
            </div>
          )}
        </div>
      )}

      {/* Compact header for multi-plan view */}
      {compact && variationInfo && (
        <div className="compact-header">
          <div className="strategy-info">
            <span className="strategy-label">Strategy:</span>
            <span className="strategy-name">{variationInfo.strategy}</span>
          </div>
        </div>
      )}

      {/* Nutrition Summary Cards */}
      <div className="nutrition-overview">
        {!compact && <h3 className="section-title">📊 Nutrition Summary</h3>}
        <div className={`nutrition-grid ${compact ? 'compact' : ''}`}>
          <div className="nutrition-card calories">
            <div className="card-icon">🔥</div>
            <div className="card-content">
              <span className="card-label">Calories</span>
              <span className="card-value">{totals.calories}</span>
              <span className="card-unit">kcal</span>
            </div>
          </div>
          
          <div className="nutrition-card protein">
            <div className="card-icon">💪</div>
            <div className="card-content">
              <span className="card-label">Protein</span>
              <span className="card-value">{totals.protein}</span>
              <span className="card-unit">g</span>
            </div>
          </div>
          
          <div className="nutrition-card sugar">
            <div className="card-icon">🍯</div>
            <div className="card-content">
              <span className="card-label">Sugar</span>
              <span className="card-value">{totals.sugar}</span>
              <span className="card-unit">g</span>
            </div>
          </div>
          
          <div className="nutrition-card fat">
            <div className="card-icon">🥑</div>
            <div className="card-content">
              <span className="card-label">Fat</span>
              <span className="card-value">{totals.fat}</span>
              <span className="card-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings && warnings.length > 0 && (
        <div className="warnings-section">
          <h3 className="warnings-title">⚠️ Considerations</h3>
          <ul className="warnings-list">
            {warnings.map((warning, index) => (
              <li key={index} className="warning-item">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meal Items Section */}
      <div className="meal-items-section">
        <h3 className="section-title">🍽️ Your Meal Items</h3>
        
        {sortedCategories.length > 0 ? (
          <div className="items-by-category">
            {sortedCategories.map(([category, items]) => (
              <div key={category} className="category-section">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <h4 className="category-title">{category}</h4>
                  <span className="category-count">({items.length} item{items.length !== 1 ? 's' : ''})</span>
                </div>
                
                <div className="category-items">
                  {items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`meal-item-card ${compact ? 'compact' : ''}`}
                      style={{'--category-color': getCategoryColor(category)}}
                    >
                      <div className="item-main">
                        <div className="item-title-section">
                          <h4 className="item-name">{item.name || `Item ${index + 1}`}</h4>
                          <div className="serving-badge">
                            x{item.servings}
                          </div>
                        </div>
                        
                        <div className="item-location">
                          <span className="location-icon">📍</span>
                          <span className="dining-hall">{item.dining_hall}</span>
                          <span className="station-divider">•</span>
                          <span className="station">{item.station}</span>
                        </div>
                      </div>
                      
                      <div className={`item-nutrition-grid ${compact ? 'compact' : ''}`}>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Calories</span>
                          <span className="nutrition-value">{Math.round(item.calories)}</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Protein</span>
                          <span className="nutrition-value">{Math.round(item.protein)}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Sugar</span>
                          <span className="nutrition-value">{Math.round(item.sugar)}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Fat</span>
                          <span className="nutrition-value">{Math.round(item.fat)}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="items-list">
            {selectedItems.map((item, index) => (
              <div key={index} className={`meal-item-card ${compact ? 'compact' : ''}`}>
                <div className="item-main">
                  <div className="item-title-section">
                    <h4 className="item-name">{item.name || `Item ${index + 1}`}</h4>
                    <div className="serving-badge">
                      x{item.servings}
                    </div>
                  </div>
                  
                  <div className="item-location">
                    <span className="location-icon">📍</span>
                    <span className="dining-hall">{item.dining_hall}</span>
                    <span className="station-divider">•</span>
                    <span className="station">{item.station}</span>
                  </div>
                </div>
                
                <div className={`item-nutrition-grid ${compact ? 'compact' : ''}`}>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Calories</span>
                    <span className="nutrition-value">{Math.round(item.calories)}</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Protein</span>
                    <span className="nutrition-value">{Math.round(item.protein)}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Sugar</span>
                    <span className="nutrition-value">{Math.round(item.sugar)}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="nutrition-label">Fat</span>
                    <span className="nutrition-value">{Math.round(item.fat)}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="actions-section">
        <div className="actions-container">
          {/* Save Status Messages */}
          {saveError && (
            <div className="save-status error">
              <span className="status-icon">❌</span>
              <span>{saveError}</span>
              {/* Show login button if auth error */}
              {(saveError.includes('log in') || saveError.includes('session has expired')) && (
                <button 
                  className="action-button login-prompt"
                  onClick={handleLoginClick}
                >
                  <span className="button-icon">🔑</span>
                  <span>Go to Login</span>
                </button>
              )}
            </div>
          )}
          
          {saved && (
            <div className="save-status success">
              <span className="status-icon">✅</span>
              <span>Meal plan saved successfully!</span>
            </div>
          )}

          {/* Authentication Info */}
          {!user && !saveError && (
            <div className="auth-info">
              <span className="info-icon">ℹ️</span>
              <span>Log in to save your meal plans</span>
            </div>
          )}

          {/* Action Buttons */}
          {user ? (
            <button 
              className={`action-button save ${saved ? 'saved' : ''}`} 
              onClick={handleSavePlan}
              disabled={saving || saved}
            >
              <span className="button-icon">
                {saving ? '⏳' : saved ? '✅' : '💾'}
              </span>
              <span>
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save This Plan'}
              </span>
            </button>
          ) : (
            // Login Button for unauthenticated users
            <button 
              className="action-button login" 
              onClick={handleLoginClick}
            >
              <span className="button-icon">🔑</span>
              <span>Log In to Save</span>
            </button>
          )}

          {/* Legacy onSave support */}
          {onSave && !user && (
            <button className="action-button save" onClick={() => onSave(mealPlan)}>
              <span className="button-icon">💾</span>
              <span>Save This Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MealPlanResults; 