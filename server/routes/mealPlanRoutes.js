import express from 'express';
import {
  getMealPlanByUser,
  createMealPlan,
  deleteMealPlan
} from '../controllers/mealPlanController.js';

import { generateOptimizedMealPlan } from "../controllers/mealPlanController.js";

const router = express.Router();

//router.get("/user", authenticateUser, getMealPlanByUser);
//router.post("/", authenticateUser, createMealPlan);
//router.delete("/:id", authenticateUser, deleteMealPlan);
router.post("/generate", generateOptimizedMealPlan);

export default router;

