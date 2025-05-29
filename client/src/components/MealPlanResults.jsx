import './MealPlanResults.css';

function MealPlanResults({ mealPlan, onSave, compact = false }) {
  if (!mealPlan) {
    return null;
  }

  const { selectedItems, itemsByCategory, totals, warnings, message, variationInfo } = mealPlan;

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
          <h4 className="warnings-title">💡 Optimization Notes</h4>
          <div className="warnings-list">
            {warnings.map((warning, index) => (
              <div key={index} className="warning-item">
                <span className="warning-bullet">•</span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Items Section */}
      <div className="meal-items-section">
        <div className="section-header">
          {!compact && <h3 className="section-title">🍽️ Your Meal Selection</h3>}
          <div className="items-count">
            <span className="count-badge">{selectedItems.length} items</span>
          </div>
        </div>
        
        {itemsByCategory ? (
          <div className="categories-container">
            {sortedCategories.map(([category, items]) => (
              <div key={category} className="category-group">
                <div 
                  className="category-header"
                  style={{ borderLeftColor: getCategoryColor(category) }}
                >
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <span className="category-name">{category}</span>
                  <span className="category-count">({items.length})</span>
                </div>
                
                <div className="category-items">
                  {items.map((item, index) => (
                    <div key={index} className={`meal-item-card ${compact ? 'compact' : ''}`}>
                      <div className="item-main">
                        <div className="item-title-section">
                          <h4 className="item-name">{item.name}</h4>
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
          {onSave && (
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