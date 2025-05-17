import express from 'express';
import {
  getMealPlanByUser,
  createMealPlan,
  deleteMealPlan
} from '../controllers/mealPlanController.js';

const router = express.Router();

router.get("/user", authenticateUser, getMealPlanByUser);
router.post("/", authenticateUser, createMealPlan);
router.delete("/:id", authenticateUser, deleteMealPlan);

export default router;