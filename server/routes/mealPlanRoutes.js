import express from 'express';
import {
  getMealPlanByUser,
  createMealPlan,
  deleteMealPlan,
  generateMealPlanForUser
} from '../controllers/mealPlanController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route without authentication for development
router.post("/generate-test", generateMealPlanForUser);

router.get("/user", authenticateUser, getMealPlanByUser);
router.post("/", authenticateUser, createMealPlan);
router.post("/generate", authenticateUser, generateMealPlanForUser);
router.delete("/:id", authenticateUser, deleteMealPlan);

export default router;