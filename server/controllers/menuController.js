import MenuItem from "../models/MenuItem.js";

export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const uploadMenuItems = async (req, res) => {
  try {
    const items = req.body;
    await MenuItem.insertMany(items);
    res.status(201).json({ message: "Menu uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

export const deleteAllMenuItems = async (req, res) => {
  try {
    await MenuItem.deleteMany();
    res.status(200).json({ message: "All menu items deleted" });
  } catch (error) {
    res.status(500).json({ message: "Deletion failed", error });
  }
};