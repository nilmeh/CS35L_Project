import express from "express";
import {
  getAllMenuItems,
  uploadMenuItems,
  deleteAllMenuItems,
  getMenuItemById,
  searchMenuItems,
  getMenuByDate,
} from "../controllers/menuController.js";

const router = express.Router();

// Search route must come before parameterized routes
router.get("/search", searchMenuItems);

// Get menu items by date
router.get("/date/:date", getMenuByDate);

// Get all menu items (with optional filtering)
router.get("/", getAllMenuItems);

// Get specific menu item by ID
router.get("/:id", getMenuItemById);

// Upload menu items
router.post("/upload", uploadMenuItems);

// Delete all menu items
router.delete("/", deleteAllMenuItems);

export default router;