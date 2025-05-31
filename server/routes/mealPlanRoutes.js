import express from 'express';
import {
  getMealPlanByUser,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  saveMealPlan,
  generateMealPlanForUser
} from '../controllers/mealPlanController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route without authentication for development
router.post("/generate-test", generateMealPlanForUser);

// Authenticated routes
router.use(authenticateUser); // Apply authentication to all routes below

// Get all meal plans for the authenticated user
router.get("/", getMealPlanByUser);

// Get a specific meal plan by ID
router.get("/:id", getMealPlanById);

// Create a new meal plan
router.post("/", createMealPlan);

// Save a generated meal plan
router.post("/save", saveMealPlan);

// Update an existing meal plan
router.put("/:id", updateMealPlan);

// Delete a meal plan
router.delete("/:id", deleteMealPlan);

// Generate a meal plan
router.post("/generate", generateMealPlanForUser);

// Legacy routes for backward compatibility
router.get("/user", getMealPlanByUser);

export default router;