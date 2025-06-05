import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { apiService } from '../services/api';
import './MyPlansPage.css';

function MyPlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMealPlans = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.mealPlans.getUserPlans({ limit: 20 });
        setMealPlans(response.plans || []);
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        setError('Failed to load meal plans');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loading, error, mealPlans]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }

    try {
      await apiService.mealPlans.delete(planId);
      setMealPlans(prev => prev.filter(plan => plan._id !== planId));
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      alert('Failed to delete meal plan');
    }
  };

  if (!user) {
    return (
      <div className="my-plans-page">
        <div className="auth-required">
          <h2>Please Log In</h2>
          <p>You need to log in to view your meal plans.</p>
          <Link to="/login" className="login-link">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-plans-page">
      <div className="my-plans-header">
        <h2>My Meal Plans</h2>
        <p>Manage your saved meal plans and create new ones</p>
      </div>

      <div className="my-plans-actions">
        <Link to="/preferences" className="create-button">
          + Create New Meal Plan
        </Link>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your meal plans...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      )}

      {!loading && !error && (
        <div className="meal-plans-grid">
          {mealPlans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No meal plans yet</h3>
              <p>Create your first meal plan to get started</p>
              <Link to="/preferences" className="create-button">
                Create Your First Plan
              </Link>
            </div>
          ) : (
            mealPlans.map((plan) => (
              <div key={plan._id} className="meal-plan-card">
                <div className="card-header">
                  <h3>{plan.name}</h3>
                  <div className="card-meta">
                    <span className="date">{formatDate(plan.date)}</span>
                    <span className="meal-time">{plan.mealTime}</span>
                    {plan.diningHall && <span className="dining-hall">{plan.diningHall}</span>}
                  </div>
                </div>

                <div className="card-nutrition">
                  <div className="nutrition-item">
                    <span className="value">{Math.round(plan.nutritionTotals?.calories || 0)}</span>
                    <span className="label">Calories</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(plan.nutritionTotals?.protein || 0)}g</span>
                    <span className="label">Protein</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(plan.nutritionTotals?.sugar || 0)}g</span>
                    <span className="label">Sugar</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(plan.nutritionTotals?.fat || 0)}g</span>
                    <span className="label">Fat</span>
                  </div>
                </div>

                <div className="card-items">
                  <p className="items-count">{plan.items?.length || 0} food items</p>
                  <div className="items-preview">
                    {(plan.items || []).slice(0, 3).map((item, index) => (
                      <span key={index} className="item-tag">
                        {item.servings > 1 ? `${item.servings}x ` : ''}{item.name}
                      </span>
                    ))}
                    {(plan.items?.length || 0) > 3 && (
                      <span className="more-items">+{plan.items.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <Link 
                    to={`/edit-plan/${plan._id}`} 
                    className="edit-button"
                  >
                    Edit Plan
                  </Link>
                  <button 
                    className="delete-button"
                    onClick={() => handleDeletePlan(plan._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MyPlansPage;