import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Replace with actual API call later
      const savedPlan = {
        id: 'mp-123456',
        name: 'My Lunch Plan',
        createdAt: '2023-05-15',
        diningHall: 'De Neve',
        mealTime: 'lunch',
        totalCalories: 850,
        totalProtein: 65,
        totalFat: 20,
        totalSugar: 15,
        items: [
          { name: 'Grilled Chicken Breast', servings: 2 },
          { name: 'Steamed Broccoli', servings: 1 },
          { name: 'Brown Rice', servings: 1 },
          { name: 'Greek Yogurt', servings: 1 }
        ]
      };
      
      setCurrentPlan(savedPlan);
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <p>Loading your meal plans...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2>Your Dashboard</h2>
        <p>View and manage your meal plans and nutritional stats</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Current Meal Plan</h3>
            <div className="section-actions">
              <Link to="/edit-plan" className="button-link">Edit Plan</Link>
              <Link to="/preferences" className="button-link secondary">New Plan</Link>
            </div>
          </div>
          
          {currentPlan ? (
            <div className="meal-plan-card">
              <div className="meal-plan-header">
                <h4>{currentPlan.name}</h4>
                <span className="meal-plan-meta">
                  {currentPlan.diningHall} • {currentPlan.mealTime}
                </span>
              </div>
              
              <div className="meal-plan-stats">
                <div className="stat-item">
                  <span className="stat-value">{currentPlan.totalCalories}</span>
                  <span className="stat-label">Calories</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{currentPlan.totalProtein}g</span>
                  <span className="stat-label">Protein</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{currentPlan.totalFat}g</span>
                  <span className="stat-label">Fat</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{currentPlan.totalSugar}g</span>
                  <span className="stat-label">Sugar</span>
                </div>
              </div>
              
              <div className="meal-plan-items">
                <h5>Meal Items</h5>
                <ul>
                  {currentPlan.items.map((item, index) => (
                    <li key={index}>
                      <span>{item.name}</span>
                      <span className="item-servings">x{item.servings}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-plan">
              <p>You don't have any meal plans yet.</p>
              <Link to="/preferences" className="button-link">Create Your First Plan</Link>
            </div>
          )}
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Nutrition Summary</h3>
          </div>
          
          <div className="nutrition-chart">
            <div className="chart-bar">
              <div className="chart-label">Protein</div>
              <div className="chart-track">
                <div 
                  className="chart-fill protein" 
                  style={{ width: `${Math.min(100, (currentPlan.totalProtein / 50) * 100)}%` }}
                ></div>
              </div>
              <div className="chart-value">{currentPlan.totalProtein}g</div>
            </div>
            
            <div className="chart-bar">
              <div className="chart-label">Fat</div>
              <div className="chart-track">
                <div 
                  className="chart-fill fat" 
                  style={{ width: `${Math.min(100, (currentPlan.totalFat / 70) * 100)}%` }}
                ></div>
              </div>
              <div className="chart-value">{currentPlan.totalFat}g</div>
            </div>
            
            <div className="chart-bar">
              <div className="chart-label">Sugar</div>
              <div className="chart-track">
                <div 
                  className="chart-fill sugar" 
                  style={{ width: `${Math.min(100, (currentPlan.totalSugar / 50) * 100)}%` }}
                ></div>
              </div>
              <div className="chart-value">{currentPlan.totalSugar}g</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 