import { useState } from 'react';
import axios from 'axios';
 
function PreferencesForm() {
  const [formData, setFormData] = useState({
    calories: '',
    allergies: '',
    likes: '',
    dislikes: '',
    diningHall: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/mealplans', formData);
      console.log('Meal plan response:', response.data);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>User Preferences</h2>

      <label>
        Calorie Goal:
        <input
          type="number"
          name="calories"
          placeholder="e.g. 600"
          value={formData.calories}
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Allergies (comma separated):
        <input
          type="text"
          name="allergies"
          placeholder="e.g. peanuts, dairy"
          value={formData.allergies}
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Foods You Like:
        <input
          type="text"
          name="likes"
          placeholder="e.g. grilled chicken"
          value={formData.likes}
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Foods You Dislike:
        <input
          type="text"
          name="dislikes"
          placeholder="e.g. mushrooms"
          value={formData.dislikes}
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Preferred Dining Halls:
        <select
          name="diningHall"
          value={formData.diningHall}
          onChange={handleChange}
        >
          <option value="">Select one</option>
          <option value="De Neve">De Neve</option>
          <option value="Covel">Covel</option>
          <option value="Bruin Plate">Bruin Plate</option>
          <option value="FEAST">FEAST</option>
        </select>
      </label>
      <br />

      <button type="submit">Generate Meal Plan</button>
    </form>
  );
}

export default PreferencesForm;
