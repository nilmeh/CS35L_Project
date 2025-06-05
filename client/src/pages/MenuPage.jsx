import { useState, useEffect } from 'react';
import { apiService, handleApiError, DINING_HALLS, MEAL_PERIODS } from '../services/api';
import './MenuPage.css';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); 
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function MenuPage() {
  const [selectedMealTime, setSelectedMealTime] = useState('breakfast');
  const [selectedDiningHall, setSelectedDiningHall] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDateString()); 
  const [availableDates, setAvailableDates] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mealTimes = MEAL_PERIODS.map(period => ({
    id: period,
    name: period.charAt(0).toUpperCase() + period.slice(1),
    time: period === 'breakfast' ? '7AM-11AM' : period === 'lunch' ? '11AM-4PM' : '4PM-10PM' 
  }));


  useEffect(() => {
    const fetchAndSetAvailableDates = async () => {
      try {
        const response = await apiService.menu.getAvailableDates();
        const fetchedDates = response.dates || [];
        setAvailableDates(fetchedDates);

      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError('Failed to load available dates');
      } 
      
    };
    fetchAndSetAvailableDates();
  }, []); 

  useEffect(() => {
    if (selectedDate) {
      fetchMenuData();
    }
  }, [selectedMealTime, selectedDiningHall, selectedDate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loading, error, menuItems]);

  const fetchMenuData = async () => {
    if (!selectedDate) {
      setMenuItems([]);
      setLoading(false);
      return;
    }
    
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
      setMenuItems(data.items || data || []); 
    } catch (err) {
      console.error('Error fetching menu data:', err);
      setError(handleApiError(err));
      setMenuItems([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
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
      
      const data = await apiService.menu.search(searchQuery.trim(), filters);
      setMenuItems(data.items || data || []);
    } catch (err) {
      console.error('Error searching menu:', err);
      setError(handleApiError(err));
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const groupMenuByCategory = () => {
    const grouped = {};
    (menuItems || []).forEach(item => { 
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
    if (!item || !item.tags) return tags;
    
    if (item.tags.some(tag => tag.toLowerCase().includes('vegetarian'))) tags.push('Vegetarian');
    if (item.tags.some(tag => tag.toLowerCase().includes('vegan'))) tags.push('Vegan');
    if (item.tags.some(tag => tag.toLowerCase().includes('gluten-free'))) tags.push('Gluten-Free');
    else if (item.tags.some(tag => tag.toLowerCase().includes('gluten'))) tags.push('Contains Gluten');
    
    return tags;
  };

  const formatAllergens = (allergens) => {
    if (!allergens || allergens.length === 0) return 'None listed';
    return allergens.join(', ');
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return 'Not available';
    return ingredients.join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    const parts = dateString.split('-');
    if (parts.length !== 3) return "Invalid Date Format";

    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    if (dateString.includes('T')) {
      dateString = dateString.split('T')[0];
    }
    
    const today = new Date();
    const todayFormatted = today.getFullYear() + '-' + 
                           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(today.getDate()).padStart(2, '0');
    
    return todayFormatted === dateString;
  };

  if (loading && menuItems.length === 0) { // Show initial loading state more clearly
    return (
      <div className="menu-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error && menuItems.length === 0) { // Show error state more clearly if no items loaded
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
            'Select a date to view menus.'
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
            disabled={availableDates.length === 0}
          >
            {/* Ensure today's date is an option, even if not in availableDates yet */}
            {!availableDates.includes(selectedDate) && selectedDate && (
                 <option key={selectedDate} value={selectedDate}>
                 {formatDate(selectedDate)} {isToday(selectedDate) && '(Today)'}
               </option>
            )}
            {availableDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)} {isToday(date) && '(Today)'}
              </option>
            ))}
            {availableDates.length === 0 && !selectedDate && (
                <option value="" disabled>Loading dates...</option>
            )}
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
          <button onClick={handleSearch} className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && <div className="loading-inline"><div className="loading-spinner small"></div> Loading...</div>}
      {error && !loading && <div className="error-inline">Error: {error} <button onClick={fetchMenuData}>Retry</button></div>}

      <div className="menu-content">
        {!loading && !error && menuItems.length === 0 ? (
          <div className="no-items">
            <p>No menu items found for the selected filters for {formatDate(selectedDate)}.</p>
            <p>Try selecting a different dining hall, meal time, or date.</p>
          </div>
        ) : (
          <div className="menu-categories">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{category}</h3>
                <div className="category-items">
                  {items.map(item => (
                    <div 
                      key={item._id || item.name} // Use _id if available, fallback to name
                      className="menu-item-card"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="item-header">
                        <h4 className="item-name">{item.name}</h4>
                        {item.dining_hall && <span className="item-location">{item.dining_hall}</span>}
                      </div>
                      <div className="item-nutrition">
                        <div className="nutrition-item">
                          <span className="nutrition-label">Calories:</span>
                          <span className="nutrition-value">
                            {item.nutrition?.calories !== undefined ? Math.round(item.nutrition.calories) : 'N/A'}
                          </span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Protein:</span>
                          <span className="nutrition-value">{item.nutrition?.protein !== undefined ? Math.round(item.nutrition.protein) : 'N/A'}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Sugar:</span>
                          <span className="nutrition-value">{item.nutrition?.sugar !== undefined ? Math.round(item.nutrition.sugar) : 'N/A'}g</span>
                        </div>
                        <div className="nutrition-item">
                          <span className="nutrition-label">Fat:</span>
                          <span className="nutrition-value">{item.nutrition?.fat !== undefined ? Math.round(item.nutrition.fat) : 'N/A'}g</span>
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
                  <div className="nutrition-detail"><span className="label">Calories:</span> <span className="value">{selectedItem.nutrition?.calories !== undefined ? Math.round(selectedItem.nutrition.calories) : 'N/A'}</span></div>
                  <div className="nutrition-detail"><span className="label">Protein:</span> <span className="value">{selectedItem.nutrition?.protein !== undefined ? Math.round(selectedItem.nutrition.protein) : 'N/A'}g</span></div>
                  <div className="nutrition-detail"><span className="label">Carbs:</span> <span className="value">{selectedItem.nutrition?.carbs !== undefined ? Math.round(selectedItem.nutrition.carbs) : 'N/A'}g</span></div>
                  <div className="nutrition-detail"><span className="label">Sugar:</span> <span className="value">{selectedItem.nutrition?.sugar !== undefined ? Math.round(selectedItem.nutrition.sugar) : 'N/A'}g</span></div>
                  <div className="nutrition-detail"><span className="label">Fat:</span> <span className="value">{selectedItem.nutrition?.fat !== undefined ? Math.round(selectedItem.nutrition.fat) : 'N/A'}g</span></div>
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
                  {(selectedItem.tags || []).filter(tag => !getDietaryTags(selectedItem).includes(tag)).map(tag => (
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
