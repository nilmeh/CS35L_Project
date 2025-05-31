import MenuItem from "../models/MenuItem.js";

export const getAllMenuItems = async (req, res) => {
  try {
    const { dining_hall, meal_period, date } = req.query;
    
    // Build filter object based on query parameters
    const filter = {};
    if (dining_hall) filter.dining_hall = dining_hall;
    if (meal_period) filter.meal_period = meal_period;
    
    // Add date filtering if provided
    if (date) {
      // Handle YYYY-MM-DD format explicitly to avoid timezone issues
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(date)) {
        // For YYYY-MM-DD format, create explicit UTC dates
        const startDate = new Date(`${date}T00:00:00.000Z`);
        const endDate = new Date(`${date}T23:59:59.999Z`);
        
        filter.date = {
          $gte: startDate,
          $lte: endDate
        };
      } else {
        // Fallback to original logic for other date formats
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        filter.date = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }

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

export const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { dining_hall } = req.query;
    
    // Parse the date and create a range for the entire day
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const filter = {
      date: {
        $gte: startDate,
        $lt: endDate
      }
    };
    
    if (dining_hall) {
      filter.dining_hall = dining_hall;
    }
    
    const menuItems = await MenuItem.find(filter);
    
    res.status(200).json({
      date,
      dining_hall: dining_hall || 'all',
      count: menuItems.length,
      items: menuItems
    });
  } catch (error) {
    console.error('Error fetching menu by date:', error);
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
};

export const searchMenuItems = async (req, res) => {
  try {
    const { 
      search, 
      date, 
      dining_hall, 
      category, 
      vegetarian, 
      vegan, 
      meal_period,
      limit = 20, 
      skip = 0 
    } = req.query;
    
    // Build search filter
    const filter = {};
    
    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Text search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Dining hall filter
    if (dining_hall && dining_hall !== '') {
      filter.dining_hall = dining_hall;
    }
    
    // Category filter
    if (category && category !== '') {
      filter.category = category;
    }
    
    // Meal period filter
    if (meal_period && meal_period !== '') {
      filter.meal_period = meal_period;
    }
    
    // Vegetarian filter
    if (vegetarian === 'true') {
      filter.vegetarian = true;
    }
    
    // Vegan filter
    if (vegan === 'true') {
      filter.vegan = true;
    }
    
    // Execute search
    const items = await MenuItem.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ name: 1 });
    
    const total = await MenuItem.countDocuments(filter);
    
    res.status(200).json({
      query: {
        search: search || '',
        date: date || '',
        dining_hall: dining_hall || '',
        category: category || '',
        vegetarian: vegetarian === 'true',
        vegan: vegan === 'true',
        meal_period: meal_period || ''
      },
      results: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        count: items.length
      },
      items
    });
  } catch (error) {
    console.error('Error searching menu items:', error);
    res.status(500).json({ message: 'Error searching menu items', error: error.message });
  }
};

export const getAvailableDates = async (req, res) => {
  try {
    // Get unique dates from the MenuItem collection
    const dates = await MenuItem.distinct('date');
    
    // Format dates as YYYY-MM-DD strings
    const formattedDates = dates
      .map(date => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      })
      .filter(date => date) // Remove any invalid dates
      .sort();
    
    res.status(200).json({
      dates: formattedDates,
      count: formattedDates.length
    });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ message: 'Error fetching available dates', error: error.message });
  }
};