import './MealPlanResults.css';

function MealPlanResults({ mealPlan }) {
  const { selectedItems, totals } = mealPlan;

  return (
    <div className="meal-plan-results">
      <h2>Your Personalized Meal Plan</h2>
      
      <div className="nutrition-summary">
        <div className="nutrition-card">
          <h3>Calories</h3>
          <p className="nutrition-value">{totals.calories}</p>
        </div>
        <div className="nutrition-card">
          <h3>Protein</h3>
          <p className="nutrition-value">{totals.protein}g</p>
        </div>
        <div className="nutrition-card">
          <h3>Sugar</h3>
          <p className="nutrition-value">{totals.sugar}g</p>
        </div>
        <div className="nutrition-card">
          <h3>Fat</h3>
          <p className="nutrition-value">{totals.fat}g</p>
        </div>
      </div>
      
      <div className="meal-items">
        <h3>Selected Items</h3>
        <ul className="items-list">
          {selectedItems.map((item, index) => (
            <li key={index} className="meal-item">
              <span className="meal-item-name">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="actions">
        <button className="save-button">Save This Plan</button>
        <button className="regenerate-button">Generate Another</button>
      </div>
    </div>
  );
}

export default MealPlanResults; 