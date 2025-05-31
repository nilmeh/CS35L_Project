import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { apiService } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalPlans: 0,
    avgCalories: 0,
    avgProtein: 0,
    weeklyNutrition: [],
    macroDistribution: { carbs: 0, protein: 0, fat: 0 },
    favoriteFoods: [],
    nutritionTrends: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.mealPlans.getUserPlans({ limit: 50 });
        const plans = response.plans || [];
        setMealPlans(plans);
        
        // Calculate analytics
        const analyticsData = calculateAnalytics(plans);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const calculateAnalytics = (plans) => {
    if (!plans || plans.length === 0) {
      return {
        totalPlans: 0,
        avgCalories: 0,
        avgProtein: 0,
        weeklyNutrition: [],
        macroDistribution: { carbs: 30, protein: 25, fat: 45 },
        favoriteFoods: [],
        nutritionTrends: []
      };
    }

    const totalCalories = plans.reduce((sum, plan) => sum + (plan.nutritionTotals?.calories || 0), 0);
    const totalProtein = plans.reduce((sum, plan) => sum + (plan.nutritionTotals?.protein || 0), 0);
    const totalFat = plans.reduce((sum, plan) => sum + (plan.nutritionTotals?.fat || 0), 0);
    const totalSugar = plans.reduce((sum, plan) => sum + (plan.nutritionTotals?.sugar || 0), 0);

    // Calculate weekly nutrition (last 7 days)
    const weeklyNutrition = getWeeklyNutrition(plans);

    // Calculate macro distribution
    const avgCaloriesFromFat = totalFat * 9 / plans.length;
    const avgCaloriesFromProtein = totalProtein * 4 / plans.length;
    const avgTotalCalories = totalCalories / plans.length;
    const avgCaloriesFromCarbs = avgTotalCalories - avgCaloriesFromFat - avgCaloriesFromProtein;

    const macroDistribution = {
      carbs: Math.round((avgCaloriesFromCarbs / avgTotalCalories) * 100) || 30,
      protein: Math.round((avgCaloriesFromProtein / avgTotalCalories) * 100) || 25,
      fat: Math.round((avgCaloriesFromFat / avgTotalCalories) * 100) || 45
    };

    // Get favorite foods
    const favoriteFoods = getFavoriteFoods(plans);

    return {
      totalPlans: plans.length,
      avgCalories: Math.round(totalCalories / plans.length) || 0,
      avgProtein: Math.round(totalProtein / plans.length) || 0,
      avgSugar: Math.round(totalSugar / plans.length) || 0,
      avgFat: Math.round(totalFat / plans.length) || 0,
      weeklyNutrition,
      macroDistribution,
      favoriteFoods,
      nutritionTrends: plans.slice(-7) // Last 7 plans for trends
    };
  };

  const getWeeklyNutrition = (plans) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return plans
      .filter(plan => new Date(plan.date) >= weekAgo)
      .map(plan => ({
        date: new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: plan.nutritionTotals?.calories || 0,
        protein: plan.nutritionTotals?.protein || 0,
        name: plan.name
      }));
  };

  const getFavoriteFoods = (plans) => {
    const foodCounts = {};
    
    plans.forEach(plan => {
      (plan.items || []).forEach(item => {
        const name = item.name;
        if (name) {
          foodCounts[name] = (foodCounts[name] || 0) + (item.servings || 1);
        }
      });
    });

    return Object.entries(foodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="auth-required">
          <h2>Welcome to UCLA Dining Planner</h2>
          <p>Please log in to view your personalized nutrition dashboard and meal planning analytics.</p>
          <Link to="/login" className="login-link">Get Started</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading your dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Nutrition Dashboard</h1>
          <p>Track your meal planning progress and nutritional insights</p>
        </div>
        <div className="header-actions">
          <Link to="/preferences" className="button-link">
            Create Meal Plan
          </Link>
          <Link to="/my-plans" className="button-link secondary">
            View All Plans
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📊 Overview Stats</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-content">
                <span className="stat-value">{analytics.totalPlans}</span>
                <span className="stat-label">Total Meal Plans</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <span className="stat-value">{analytics.avgCalories}</span>
                <span className="stat-label">Avg Calories/Plan</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <span className="stat-value">{analytics.avgProtein}g</span>
                <span className="stat-label">Avg Protein/Plan</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🥑</div>
              <div className="stat-content">
                <span className="stat-value">{analytics.avgFat}g</span>
                <span className="stat-label">Avg Fat/Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Meal Plan */}
        {mealPlans.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h3>🍽️ Latest Meal Plan</h3>
              <Link to="/my-plans" className="button-link secondary">View All</Link>
            </div>
            <div className="meal-plan-card">
              <div className="meal-plan-header">
                <h4>{mealPlans[0].name}</h4>
                <p className="meal-plan-meta">
                  {new Date(mealPlans[0].date).toLocaleDateString()} • {mealPlans[0].mealTime}
                  {mealPlans[0].diningHall && ` • ${mealPlans[0].diningHall}`}
                </p>
              </div>
              <div className="meal-plan-stats">
                <div className="stat-item">
                  <span className="stat-value">{Math.round(mealPlans[0].nutritionTotals?.calories || 0)}</span>
                  <span className="stat-label">Calories</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.round(mealPlans[0].nutritionTotals?.protein || 0)}g</span>
                  <span className="stat-label">Protein</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.round(mealPlans[0].nutritionTotals?.sugar || 0)}g</span>
                  <span className="stat-label">Sugar</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.round(mealPlans[0].nutritionTotals?.fat || 0)}g</span>
                  <span className="stat-label">Fat</span>
                </div>
              </div>
              <div className="meal-plan-items">
                <h5>Food Items ({mealPlans[0].items?.length || 0})</h5>
                {(mealPlans[0].items || []).length > 0 ? (
                  <ul>
                    {(mealPlans[0].items || []).slice(0, 5).map((item, index) => (
                      <li key={index}>
                        <span>{item.name}</span>
                        <span className="item-servings">x{item.servings || 1}</span>
                      </li>
                    ))}
                    {(mealPlans[0].items?.length || 0) > 5 && (
                      <li className="more-items">+{mealPlans[0].items.length - 5} more items</li>
                    )}
                  </ul>
                ) : (
                  <div className="empty-plan">
                    <p>No items in this meal plan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Analytics */}
        <div className="nutrition-chart">
          <div className="section-header">
            <h3>📈 Nutrition Analytics</h3>
          </div>
          
          {/* Macro Distribution Chart */}
          <div className="chart-container macro-distribution-chart">
            <h5>Macronutrient Distribution</h5>
            <div className="macro-chart">
              <div className="macro-item">
                <div 
                  className="macro-bar carbs" 
                  style={{ width: `${analytics.macroDistribution.carbs}%` }}
                ></div>
                <span className="macro-label">Carbs {analytics.macroDistribution.carbs}%</span>
              </div>
              <div className="macro-item">
                <div 
                  className="macro-bar protein" 
                  style={{ width: `${analytics.macroDistribution.protein}%` }}
                ></div>
                <span className="macro-label">Protein {analytics.macroDistribution.protein}%</span>
              </div>
              <div className="macro-item">
                <div 
                  className="macro-bar fat" 
                  style={{ width: `${analytics.macroDistribution.fat}%` }}
                ></div>
                <span className="macro-label">Fat {analytics.macroDistribution.fat}%</span>
              </div>
            </div>
          </div>

          {/* Weekly Nutrition Chart */}
          {analytics.weeklyNutrition.length > 0 && (
            <div className="chart-container weekly-chart">
              <h5>Weekly Nutrition Trends</h5>
              <div className="weekly-chart-grid">
                {analytics.weeklyNutrition.map((day, index) => (
                  <div key={index} className="day-column">
                    <div className="day-label">{day.date}</div>
                    <div className="calorie-bar">
                      <div 
                        className="calorie-fill" 
                        style={{ height: `${Math.min(day.calories / 20, 100)}%` }}
                        title={`${day.calories} calories`}
                      ></div>
                    </div>
                    <div className="day-calories">{day.calories}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Foods */}
          {analytics.favoriteFoods.length > 0 && (
            <div className="chart-container food-items-chart">
              <h5>Most Frequently Selected Foods</h5>
              <div className="food-items-list">
                {analytics.favoriteFoods.map((food, index) => (
                  <div key={index} className="food-item">
                    <span className="food-name">{food.name}</span>
                    <div className="food-bar">
                      <div 
                        className="food-fill" 
                        style={{ width: `${(food.count / analytics.favoriteFoods[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="food-count">{food.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🚀 Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/preferences" className="action-card">
              <div className="action-icon">✨</div>
              <h4>Create Meal Plan</h4>
              <p>Generate a personalized meal plan based on your preferences</p>
            </Link>
            <Link to="/menu" className="action-card">
              <div className="action-icon">📋</div>
              <h4>Browse Menu</h4>
              <p>Explore available dining options and nutritional information</p>
            </Link>
            <Link to="/my-plans" className="action-card">
              <div className="action-icon">📝</div>
              <h4>Manage Plans</h4>
              <p>View, edit, and organize your saved meal plans</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 