import express from "express";
import {
  getAllMenuItems,
  uploadMenuItems,
  deleteAllMenuItems,
  getMenuItemById,
  searchMenuItems,
  getMenuByDate,
  getAvailableDates,
} from "../controllers/menuController.js";

const router = express.Router();

// Specific routes must come before parameterized routes
router.get("/search", searchMenuItems);
router.get("/dates", getAvailableDates);

// Get menu items by date
router.get("/date/:date", getMenuByDate);

// Upload menu items
router.post("/upload", uploadMenuItems);

// Delete all menu items
router.delete("/", deleteAllMenuItems);

// Get all menu items (with optional filtering)
router.get("/", getAllMenuItems);

// Get specific menu item by ID (must be last)
router.get("/:id", getMenuItemById);

export default router;