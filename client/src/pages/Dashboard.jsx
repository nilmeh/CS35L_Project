import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, ResponsiveContainer, Cell, Tooltip, XAxis, YAxis,
  Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import './Dashboard.css';

// Color palette for charts
const CHART_COLORS = {
  protein: '#4264d0',
  fat: '#f6b93b',
  sugar: '#e55039',
  carbs: '#6ab04c',
  calories: '#4834d4'
};

function Dashboard() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  
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
        totalCarbs: 95,
        items: [
          { name: 'Grilled Chicken Breast', servings: 2, calories: 240, protein: 42, fat: 6, carbs: 0, sugar: 0 },
          { name: 'Steamed Broccoli', servings: 1, calories: 55, protein: 3, fat: 0, carbs: 11, sugar: 2 },
          { name: 'Brown Rice', servings: 1, calories: 215, protein: 5, fat: 2, carbs: 45, sugar: 1 },
          { name: 'Greek Yogurt', servings: 1, calories: 100, protein: 15, fat: 0, carbs: 6, sugar: 6 },
          { name: 'Apple', servings: 1, calories: 95, protein: 0, fat: 0, carbs: 25, sugar: 6 }
        ]
      };
      
      // Generate mock weekly data
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekData = days.map(day => ({
        day,
        calories: Math.floor(Math.random() * 500) + 700,
        protein: Math.floor(Math.random() * 30) + 50,
        fat: Math.floor(Math.random() * 15) + 15,
        sugar: Math.floor(Math.random() * 10) + 10,
        carbs: Math.floor(Math.random() * 50) + 80
      }));
      
      setWeeklyData(weekData);
      setCurrentPlan(savedPlan);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Create data for pie chart showing macro distribution
  const createMacroData = () => {
    if (!currentPlan) return [];
    
    // Calculate total calories from macros
    const proteinCals = currentPlan.totalProtein * 4;
    const carbsCals = currentPlan.totalCarbs * 4;
    const fatCals = currentPlan.totalFat * 9;
    
    return [
      { name: 'Protein', value: proteinCals, percent: Math.round((proteinCals / currentPlan.totalCalories) * 100), color: CHART_COLORS.protein },
      { name: 'Carbs', value: carbsCals, percent: Math.round((carbsCals / currentPlan.totalCalories) * 100), color: CHART_COLORS.carbs },
      { name: 'Fat', value: fatCals, percent: Math.round((fatCals / currentPlan.totalCalories) * 100), color: CHART_COLORS.fat }
    ];
  };
  
  // Create data for food items bar chart
  const createFoodItemsData = () => {
    if (!currentPlan) return [];
    return currentPlan.items.map(item => ({
      name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      sugar: item.sugar,
      fullName: item.name // for tooltip
    }));
  };
  
  // Create data for radar chart
  const createNutritionRadarData = () => {
    if (!currentPlan) return [];
    
    // Define ideal daily values
    const idealDailyValues = {
      protein: 50, // g
      fat: 65, // g
      sugar: 25, // g
      carbs: 300, // g
      calories: 2000 // kcal
    };
    
    return [
      {
        subject: 'Protein',
        A: Math.min(100, Math.round((currentPlan.totalProtein / idealDailyValues.protein) * 100)),
        fullMark: 100
      },
      {
        subject: 'Fat',
        A: Math.min(100, Math.round((currentPlan.totalFat / idealDailyValues.fat) * 100)),
        fullMark: 100
      },
      {
        subject: 'Sugar',
        A: Math.min(100, Math.round((currentPlan.totalSugar / idealDailyValues.sugar) * 100)),
        fullMark: 100
      },
      {
        subject: 'Carbs',
        A: Math.min(100, Math.round((currentPlan.totalCarbs / idealDailyValues.carbs) * 100)),
        fullMark: 100
      },
      {
        subject: 'Calories',
        A: Math.min(100, Math.round((currentPlan.totalCalories / idealDailyValues.calories) * 100)),
        fullMark: 100
      }
    ];
  };
  
  // Custom tooltip for the pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].name}: ${payload[0].payload.percent}%`}</p>
          <p className="intro">{`${payload[0].value} calories`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for the bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{payload[0].payload.fullName}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
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
              
              <div className="macro-distribution-chart">
                <h5>Calorie Distribution</h5>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={createMacroData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${percent}%`}
                      >
                        {createMacroData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
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
                
                <div className="food-items-chart">
                  <h5>Nutrition by Food Item</h5>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={createFoodItemsData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }} 
                          angle={-45} 
                          textAnchor="end"
                        />
                        <YAxis />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Legend />
                        <Bar dataKey="protein" name="Protein (g)" fill={CHART_COLORS.protein} />
                        <Bar dataKey="carbs" name="Carbs (g)" fill={CHART_COLORS.carbs} />
                        <Bar dataKey="fat" name="Fat (g)" fill={CHART_COLORS.fat} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
            <h5>Daily Targets</h5>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={createNutritionRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar name="Percentage of Daily Goal" dataKey="A" stroke={CHART_COLORS.protein} 
                    fill={CHART_COLORS.protein} fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="weekly-chart">
            <h5>Weekly Nutrition Trends</h5>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={weeklyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke={CHART_COLORS.protein} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="carbs" stroke={CHART_COLORS.carbs} />
                  <Line type="monotone" dataKey="fat" stroke={CHART_COLORS.fat} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 