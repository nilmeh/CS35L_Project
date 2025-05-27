import MenuItem from "../models/MenuItem.js";

export const getAllMenuItems = async (req, res) => {
  try {
    const { dining_hall, meal_period } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    if (dining_hall) filter.dining_hall = dining_hall;
    if (meal_period) filter.meal_period = meal_period;

    const menuItems = await MenuItem.find(filter);
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const uploadMenuItems = async (req, res) => {
  try {
    const items = req.body;
    
    // Validate that items is an array
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Request body must be an array of menu items" });
    }

    // Clear existing items and insert new ones
    await MenuItem.deleteMany();
    await MenuItem.insertMany(items);
    
    res.status(201).json({ 
      message: "Menu uploaded successfully", 
      count: items.length 
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const deleteAllMenuItems = async (req, res) => {
  try {
    const result = await MenuItem.deleteMany();
    res.status(200).json({ 
      message: "All menu items deleted", 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Deletion failed:", error);
    res.status(500).json({ message: "Deletion failed", error: error.message });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    
    res.status(200).json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const searchMenuItems = async (req, res) => {
  try {
    const { query, dining_hall, meal_period } = req.query;
    
    const filter = {};
    if (dining_hall) filter.dining_hall = dining_hall;
    if (meal_period) filter.meal_period = meal_period;
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { station: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    const menuItems = await MenuItem.find(filter);
    res.status(200).json(menuItems);
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};