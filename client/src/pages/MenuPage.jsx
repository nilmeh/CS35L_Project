import { useState, useEffect } from 'react';
import './MenuPage.css';

function MenuPage() {
  const [selectedMealTime, setSelectedMealTime] = useState('breakfast');
  const [selectedDiningHall, setSelectedDiningHall] = useState('De Neve');
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const diningHalls = [
    'De Neve',
    'Epicuria at Covel',
    'Feast at Rieber',
    'Bruin Plate'
  ];

  const mealTimes = [
    { id: 'breakfast', name: 'Breakfast', time: '7:00 AM - 11:00 AM' },
    { id: 'lunch', name: 'Lunch', time: '11:00 AM - 4:00 PM' },
    { id: 'dinner', name: 'Dinner', time: '4:00 PM - 10:00 PM' }
  ];

  useEffect(() => {
    // Simulate API call to fetch menu data
    setTimeout(() => {
      const mockMenuData = {
        'De Neve': {
          breakfast: [
            {
              id: 1,
              name: 'Scrambled Eggs',
              category: 'The Front Burner',
              calories: 140,
              protein: 12,
              fat: 10,
              carbs: 2,
              sugar: 1,
              ingredients: ['Eggs', 'Butter', 'Salt', 'Pepper'],
              allergens: ['Eggs'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              description: 'Fluffy scrambled eggs cooked to perfection with butter and seasoning.'
            },
            {
              id: 2,
              name: 'Whole Wheat Pancakes',
              category: 'The Front Burner',
              calories: 220,
              protein: 8,
              fat: 4,
              carbs: 42,
              sugar: 8,
              ingredients: ['Whole wheat flour', 'Eggs', 'Milk', 'Baking powder', 'Sugar'],
              allergens: ['Gluten', 'Eggs', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Hearty whole wheat pancakes served with maple syrup.'
            },
            {
              id: 3,
              name: 'Fresh Fruit Bowl',
              category: 'Market Salads & Fruit',
              calories: 80,
              protein: 1,
              fat: 0,
              carbs: 20,
              sugar: 18,
              ingredients: ['Strawberries', 'Blueberries', 'Bananas', 'Grapes'],
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Seasonal fresh fruits including strawberries, blueberries, bananas, and grapes.'
            },
            {
              id: 4,
              name: 'Greek Yogurt',
              category: 'Market Salads & Fruit',
              calories: 100,
              protein: 15,
              fat: 0,
              carbs: 6,
              sugar: 6,
              ingredients: ['Greek yogurt', 'Live cultures'],
              allergens: ['Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              description: 'Creamy non-fat Greek yogurt packed with protein.'
            }
          ],
          lunch: [
            {
              id: 5,
              name: 'Grilled Chicken Breast',
              category: 'The Grill',
              calories: 185,
              protein: 35,
              fat: 4,
              carbs: 0,
              sugar: 0,
              ingredients: ['Chicken breast', 'Olive oil', 'Herbs', 'Spices'],
              allergens: [],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              description: 'Tender grilled chicken breast seasoned with herbs and spices.'
            },
            {
              id: 6,
              name: 'Margherita Pizza',
              category: 'The Pizzeria',
              calories: 280,
              protein: 12,
              fat: 10,
              carbs: 36,
              sugar: 4,
              ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Fresh basil'],
              allergens: ['Gluten', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Classic Margherita pizza with fresh mozzarella and basil.'
            },
            {
              id: 7,
              name: 'Quinoa Salad',
              category: 'Field Greens Bar',
              calories: 160,
              protein: 6,
              fat: 4,
              carbs: 27,
              sugar: 3,
              ingredients: ['Quinoa', 'Cucumber', 'Tomatoes', 'Red onion', 'Lemon vinaigrette'],
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Fresh quinoa salad with vegetables and zesty lemon vinaigrette.'
            },
            {
              id: 8,
              name: 'Roasted Sweet Potatoes',
              category: 'Seasonal Sides',
              calories: 112,
              protein: 2,
              fat: 0,
              carbs: 26,
              sugar: 5,
              ingredients: ['Sweet potatoes', 'Olive oil', 'Sea salt', 'Herbs'],
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Roasted sweet potato wedges with herbs and sea salt.'
            }
          ],
          dinner: [
            {
              id: 9,
              name: 'Herb-Crusted Salmon',
              category: 'Harvest Kitchen',
              calories: 206,
              protein: 22,
              fat: 12,
              carbs: 0,
              sugar: 0,
              ingredients: ['Atlantic salmon', 'Lemon', 'Dill', 'Olive oil'],
              allergens: ['Fish'],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              description: 'Fresh Atlantic salmon fillet with herb crust and lemon.'
            },
            {
              id: 10,
              name: 'BBQ Pulled Pork',
              category: 'The Grill',
              calories: 245,
              protein: 28,
              fat: 12,
              carbs: 8,
              sugar: 6,
              ingredients: ['Pork shoulder', 'BBQ sauce', 'Spices', 'Brown sugar'],
              allergens: [],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              description: 'Slow-cooked pulled pork with tangy BBQ sauce.'
            },
            {
              id: 11,
              name: 'Chocolate Brownie',
              category: 'The Sweet Stop',
              calories: 350,
              protein: 4,
              fat: 15,
              carbs: 52,
              sugar: 35,
              ingredients: ['Chocolate', 'Flour', 'Sugar', 'Butter', 'Eggs'],
              allergens: ['Gluten', 'Eggs', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Rich, fudgy chocolate brownie made from scratch.'
            },
            {
              id: 12,
              name: 'Garden Vegetable Medley',
              category: 'Seasonal Sides',
              calories: 85,
              protein: 3,
              fat: 3,
              carbs: 14,
              sugar: 6,
              ingredients: ['Zucchini', 'Yellow squash', 'Red bell pepper', 'Olive oil', 'Herbs'],
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Seasonal vegetables roasted to perfection with olive oil and herbs.'
            }
          ]
        },
        'Epicuria at Covel': {
          breakfast: [
            {
              id: 13,
              name: 'Mediterranean Scramble',
              category: 'Capri',
              calories: 165,
              protein: 14,
              fat: 12,
              carbs: 3,
              sugar: 2,
              ingredients: ['Eggs', 'Feta cheese', 'Spinach', 'Tomatoes', 'Olive oil'],
              allergens: ['Eggs', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              description: 'Mediterranean-style scrambled eggs with feta, spinach, and tomatoes.'
            },
            {
              id: 14,
              name: 'Greek Yogurt Parfait',
              category: 'Dolce',
              calories: 180,
              protein: 12,
              fat: 3,
              carbs: 28,
              sugar: 22,
              ingredients: ['Greek yogurt', 'Honey', 'Granola', 'Berries'],
              allergens: ['Milk', 'Nuts'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Creamy Greek yogurt layered with honey, granola, and fresh berries.'
            }
          ],
          lunch: [
            {
              id: 15,
              name: 'Grilled Chicken Souvlaki',
              category: 'Psistaria',
              calories: 220,
              protein: 32,
              fat: 8,
              carbs: 4,
              sugar: 2,
              ingredients: ['Chicken breast', 'Lemon', 'Oregano', 'Olive oil', 'Garlic'],
              allergens: [],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              description: 'Traditional Greek grilled chicken skewers with lemon and oregano.'
            },
            {
              id: 16,
              name: 'Caprese Pizza',
              category: 'Capri Pizza',
              calories: 290,
              protein: 14,
              fat: 12,
              carbs: 35,
              sugar: 4,
              ingredients: ['Pizza dough', 'Mozzarella', 'Tomatoes', 'Basil', 'Balsamic'],
              allergens: ['Gluten', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Fresh mozzarella, tomatoes, and basil with balsamic drizzle.'
            },
            {
              id: 17,
              name: 'Hummus & Pita',
              category: 'Mezze',
              calories: 140,
              protein: 6,
              fat: 6,
              carbs: 18,
              sugar: 1,
              ingredients: ['Chickpeas', 'Tahini', 'Lemon', 'Garlic', 'Pita bread'],
              allergens: ['Gluten', 'Sesame'],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              description: 'Creamy hummus served with warm pita bread and olive oil.'
            }
          ],
          dinner: [
            {
              id: 18,
              name: 'Penne Arrabbiata',
              category: 'Alimenti',
              calories: 320,
              protein: 12,
              fat: 8,
              carbs: 54,
              sugar: 6,
              ingredients: ['Penne pasta', 'Tomatoes', 'Garlic', 'Red pepper', 'Olive oil'],
              allergens: ['Gluten'],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              description: 'Spicy tomato sauce with garlic and red pepper flakes over penne.'
            },
            {
              id: 19,
              name: 'Tiramisu',
              category: 'Dolce',
              calories: 450,
              protein: 6,
              fat: 28,
              carbs: 42,
              sugar: 32,
              ingredients: ['Mascarpone', 'Ladyfingers', 'Espresso', 'Cocoa', 'Sugar'],
              allergens: ['Gluten', 'Eggs', 'Milk'],
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: false,
              description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.'
            }
          ]
        },
        'Bruin Plate': {
          breakfast: [
            {
              id: 20,
              name: 'Acai Bowl',
              category: 'Freshly Bowled',
              calories: 195,
              protein: 4,
              fat: 8,
              carbs: 32,
              sugar: 24,
              ingredients: ['Acai puree', 'Banana', 'Granola', 'Coconut', 'Berries'],
              allergens: ['Nuts'],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: false,
              description: 'Antioxidant-rich acai bowl topped with fresh fruits and granola.'
            }
          ],
          lunch: [
            {
              id: 21,
              name: 'Grilled Portobello',
              category: 'Simply Grilled',
              calories: 45,
              protein: 4,
              fat: 1,
              carbs: 8,
              sugar: 4,
              ingredients: ['Portobello mushroom', 'Balsamic vinegar', 'Herbs', 'Olive oil'],
              allergens: [],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Grilled portobello mushroom with balsamic glaze and herbs.'
            },
            {
              id: 22,
              name: 'Harvest Grain Bowl',
              category: 'Harvest',
              calories: 380,
              protein: 14,
              fat: 12,
              carbs: 58,
              sugar: 8,
              ingredients: ['Quinoa', 'Brown rice', 'Roasted vegetables', 'Tahini dressing'],
              allergens: ['Sesame'],
              isVegetarian: true,
              isVegan: true,
              isGlutenFree: true,
              description: 'Nutritious bowl with quinoa, brown rice, and seasonal vegetables.'
            }
          ],
          dinner: [
            {
              id: 23,
              name: 'Wood-Fired Salmon',
              category: 'The Oven',
              calories: 225,
              protein: 25,
              fat: 13,
              carbs: 0,
              sugar: 0,
              ingredients: ['Salmon', 'Lemon', 'Herbs', 'Olive oil'],
              allergens: ['Fish'],
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: true,
              description: 'Wood-fired salmon with fresh herbs and lemon.'
            }
          ]
        }
      };
      setMenuData(mockMenuData);
      setLoading(false);
    }, 800);
  }, []);

  const getCurrentMenu = () => {
    return menuData[selectedDiningHall]?.[selectedMealTime] || [];
  };

  const groupMenuByCategory = () => {
    const menu = getCurrentMenu();
    const grouped = {};
    
    menu.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
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
    if (item.isVegan) tags.push({ text: 'Vegan', className: 'tag-vegan' });
    else if (item.isVegetarian) tags.push({ text: 'Vegetarian', className: 'tag-vegetarian' });
    if (item.isGlutenFree) tags.push({ text: 'Gluten-Free', className: 'tag-gluten-free' });
    return tags;
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-loading">
          <p>Loading today's menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h2>Today's Menu</h2>
        <p>Discover delicious and nutritious meals available today</p>
      </div>

      <div className="menu-controls">
        <div className="control-group">
          <label>Dining Hall</label>
          <select 
            value={selectedDiningHall} 
            onChange={(e) => setSelectedDiningHall(e.target.value)}
          >
            {diningHalls.map(hall => (
              <option key={hall} value={hall}>{hall}</option>
            ))}
          </select>
        </div>

        <div className="meal-time-tabs">
          {mealTimes.map(mealTime => (
            <button
              key={mealTime.id}
              className={`meal-tab ${selectedMealTime === mealTime.id ? 'active' : ''}`}
              onClick={() => setSelectedMealTime(mealTime.id)}
            >
              <span className="meal-name">{mealTime.name}</span>
              <span className="meal-time">{mealTime.time}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {Object.entries(groupMenuByCategory()).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h3 className="category-title">{category}</h3>
            <div className="menu-items-grid">
              {items.map(item => (
                <div 
                  key={item.id} 
                  className="menu-item-card"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="menu-item-header">
                    <h4 className="item-name">{item.name}</h4>
                    <div className="dietary-tags">
                      {getDietaryTags(item).map((tag, index) => (
                        <span key={index} className={`dietary-tag ${tag.className}`}>
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="item-description">{item.description}</p>
                  
                  <div className="nutrition-summary">
                    <div className="nutrition-item">
                      <span className="nutrition-value">{item.calories}</span>
                      <span className="nutrition-label">cal</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{item.protein}g</span>
                      <span className="nutrition-label">protein</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{item.fat}g</span>
                      <span className="nutrition-label">fat</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{item.carbs}g</span>
                      <span className="nutrition-label">carbs</span>
                    </div>
                  </div>
                  
                  <div className="click-hint">
                    <span>Click for details</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {getCurrentMenu().length === 0 && (
          <div className="empty-menu">
            <p>No menu items available for {selectedMealTime} at {selectedDiningHall}.</p>
          </div>
        )}
      </div>

      {}
      {showDetails && selectedItem && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedItem.name}</h3>
              <button className="close-button" onClick={closeDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="item-details">
                <div className="dietary-info">
                  {getDietaryTags(selectedItem).map((tag, index) => (
                    <span key={index} className={`dietary-tag ${tag.className}`}>
                      {tag.text}
                    </span>
                  ))}
                </div>
                
                <p className="full-description">{selectedItem.description}</p>
                
                <div className="detailed-nutrition">
                  <h4>Nutrition Information</h4>
                  <div className="nutrition-grid">
                    <div className="nutrition-detail">
                      <span className="label">Calories</span>
                      <span className="value">{selectedItem.calories}</span>
                    </div>
                    <div className="nutrition-detail">
                      <span className="label">Protein</span>
                      <span className="value">{selectedItem.protein}g</span>
                    </div>
                    <div className="nutrition-detail">
                      <span className="label">Fat</span>
                      <span className="value">{selectedItem.fat}g</span>
                    </div>
                    <div className="nutrition-detail">
                      <span className="label">Carbohydrates</span>
                      <span className="value">{selectedItem.carbs}g</span>
                    </div>
                    <div className="nutrition-detail">
                      <span className="label">Sugar</span>
                      <span className="value">{selectedItem.sugar}g</span>
                    </div>
                  </div>
                </div>
                
                <div className="ingredients-section">
                  <h4>Ingredients</h4>
                  <p className="ingredients-list">
                    {selectedItem.ingredients.join(', ')}
                  </p>
                </div>
                
                {selectedItem.allergens.length > 0 && (
                  <div className="allergens-section">
                    <h4>Contains</h4>
                    <div className="allergens-list">
                      {selectedItem.allergens.map((allergen, index) => (
                        <span key={index} className="allergen-tag">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MenuPage; 