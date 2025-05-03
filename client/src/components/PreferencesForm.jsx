function PreferencesForm() {
    return (
      <form>
        <h2>User Preferences</h2>
  
        <label>
          Calorie Goal:
          <input type="number" name="calories" placeholder="e.g. 600" />
        </label>
        <br />
  
        <label>
          Allergies (comma separated):
          <input type="text" name="allergies" placeholder="e.g. peanuts, dairy" />
        </label>
        <br />
  
        <label>
          Foods You Like:
          <input type="text" name="likes" placeholder="e.g. grilled chicken" />
        </label>
        <br />
  
        <label>
          Foods You Dislike:
          <input type="text" name="dislikes" placeholder="e.g. mushrooms" />
        </label>
        <br />
  
        <label>
          Preferred Dining Halls:
          <select name="diningHall">
            <option value="">Select one</option>
            <option value="De Neve">De Neve</option>
            <option value="Epicuria">Epicuria</option>
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
  