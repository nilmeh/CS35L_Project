import { useState, useEffect } from 'react';
import { apiService, handleApiError, DINING_HALLS, MEAL_PERIODS } from '../services/api';
import './MenuPage.css';

function MenuPage() {
  const [selectedMealTime, setSelectedMealTime] = useState('breakfast');
  const [selectedDiningHall, setSelectedDiningHall] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mealTimes = [
    { id: 'breakfast', name: 'Breakfast', time: '7:00 AM - 11:00 AM' },
    { id: 'lunch', name: 'Lunch', time: '11:00 AM - 4:00 PM' },
    { id: 'dinner', name: 'Dinner', time: '4:00 PM - 10:00 PM' }
  ];

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      // Default to the first available date (usually today)
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  useEffect(() => {
    if (selectedDate) {
      fetchMenuData();
    }
  }, [selectedMealTime, selectedDiningHall, selectedDate]);

  const fetchAvailableDates = async () => {
    try {
      const dates = await apiService.menu.getAvailableDates();
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      setError('Failed to load available dates');
    }
  };

  const fetchMenuData = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        meal_period: selectedMealTime,
        date: selectedDate
      };
      
      if (selectedDiningHall) {
        filters.dining_hall = selectedDiningHall;
      }
      
      const data = await apiService.menu.getAll(filters);
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMenuData();
      return;
    }
    
    if (!selectedDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        meal_period: selectedMealTime,
        date: selectedDate
      };
      
      if (selectedDiningHall) {
        filters.dining_hall = selectedDiningHall;
      }
      
      const data = await apiService.menu.search(searchQuery, filters);
      setMenuItems(data);
    } catch (error) {
      console.error('Error searching menu:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const groupMenuByCategory = () => {
    const grouped = {};
    menuItems.forEach(item => {
      const category = item.station || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedItem(null);
  };

  const getDietaryTags = (item) => {
    const tags = [];
    
    if (item.tags) {
      if (item.tags.some(tag => tag.toLowerCase().includes('vegetarian'))) {
        tags.push('Vegetarian');
      }
      if (item.tags.some(tag => tag.toLowerCase().includes('vegan'))) {
        tags.push('Vegan');
      }
      if (item.tags.some(tag => tag.toLowerCase().includes('gluten'))) {
        tags.push('Contains Gluten');
      }
    }
    
    return tags;
  };

  const formatAllergens = (allergens) => {
    if (!allergens || allergens.length === 0) return 'None';
    return allergens.join(', ');
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return 'Not available';
    return ingredients.join(', ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="error-container">
          <h3>⚠️ Error Loading Menu</h3>
          <p>{error}</p>
          <button onClick={fetchMenuData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedMenu = groupMenuByCategory();

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>UCLA Dining Menus</h1>
        <p>
          {selectedDate ? 
            `Explore delicious options for ${formatDate(selectedDate)}${isToday(selectedDate) ? ' (Today)' : ''}` :
            'Loading available dates...'
          }
        </p>
      </div>

      <div className="menu-filters">
        <div className="filter-group">
          <label htmlFor="mealTime">Meal Time:</label>
          <select
            id="mealTime"
            value={selectedMealTime}
            onChange={(e) => setSelectedMealTime(e.target.value)}
          >
            {mealTimes.map(meal => (
              <option key={meal.id} value={meal.id}>
                {meal.name} ({meal.time})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="diningHall">Dining Hall:</label>
          <select
            id="diningHall"
            value={selectedDiningHall}
            onChange={(e) => setSelectedDiningHall(e.target.value)}
          >
            <option value="">All Dining Halls</option>
            {DINING_HALLS.map(hall => (
              <option key={hall} value={hall}>{hall}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date">Date:</label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)} {isToday(date) && '(Today)'}
              </option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
      </div>

      <div className="menu-content">
        {menuItems.length === 0 ? (
          <div className="no-items">
            <p>No menu items found for the selected filters.</p>
            <p>Try selecting a different dining hall or meal time.</p>
          </div>
        ) : (
          <div className="menu-categories">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
                <div className="category-items">
                  {items.map(item => (
                    <div 
                      key={item._id} 
                      className="menu-item-card"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="item-header">
                        <h4 className="item-name">{item.name}</h4>
                        <span className="item-location">{item.dining_hall}</span>
                      </div>
                      
                      <div className="item-nutrition">
                        <div className="nutrition-item">
                          <span className="nutrition-label">Calories:</span>
                          <span className="nutrition-value">
                            {Math.round((item.nutrition?.fat || 0) * 9 + (item.nutrition?.protein || 0) * 4 + (item.nutrition?.carbs || 0) * 4)}
                          </span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Protein:</span>
                          <span className="nutrition-value">{item.nutrition?.protein || 0}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Sugar:</span>
                          <span className="nutrition-value">{item.nutrition?.sugar || 0}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Fat:</span>
                          <span className="nutrition-value">{item.nutrition?.fat || 0}g</span>
                        </div>
                      </div>
                      
                      <div className="item-tags">
                        {getDietaryTags(item).map(tag => (
                          <span key={tag} className="dietary-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDetails && selectedItem && (
        <div className="item-details-overlay" onClick={closeDetails}>
          <div className="item-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeDetails}>×</button>
            
            <div className="details-header">
              <h2>{selectedItem.name}</h2>
              <p className="details-location">{selectedItem.dining_hall} - {selectedItem.station}</p>
            </div>
            
            <div className="details-content">
              <div className="nutrition-details">
                <h3>Nutrition Information</h3>
                <div className="nutrition-grid">
                  <div className="nutrition-detail">
                    <span className="label">Calories:</span>
                    <span className="value">
                      {Math.round((selectedItem.nutrition?.fat || 0) * 9 + (selectedItem.nutrition?.protein || 0) * 4 + (selectedItem.nutrition?.carbs || 0) * 4)}
                    </span>
                  </div>
                  <div className="nutrition-detail">
                    <span className="label">Protein:</span>
                    <span className="value">{selectedItem.nutrition?.protein || 0}g</span>
                  </div>
                  <div className="nutrition-detail">
                    <span className="label">Carbs:</span>
                    <span className="value">{selectedItem.nutrition?.carbs || 0}g</span>
                  </div>
                  <div className="nutrition-detail">
                    <span className="label">Sugar:</span>
                    <span className="value">{selectedItem.nutrition?.sugar || 0}g</span>
                  </div>
                  <div className="nutrition-detail">
                    <span className="label">Fat:</span>
                    <span className="value">{selectedItem.nutrition?.fat || 0}g</span>
                  </div>
                </div>
              </div>
              
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <p>{formatIngredients(selectedItem.ingredients)}</p>
              </div>
              
              <div className="allergens-section">
                <h3>Allergens</h3>
                <p>{formatAllergens(selectedItem.allergens)}</p>
              </div>
              
              <div className="tags-section">
                <h3>Dietary Information</h3>
                <div className="tags-list">
                  {getDietaryTags(selectedItem).map(tag => (
                    <span key={tag} className="dietary-tag">{tag}</span>
                  ))}
                  {selectedItem.tags && selectedItem.tags.map(tag => (
                    <span key={tag} className="general-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage; 