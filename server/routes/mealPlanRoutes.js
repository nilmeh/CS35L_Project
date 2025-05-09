import express from 'express';
import {
  getAllMealPlans,
  createMealPlan,
  deleteMealPlan
} from '../controllers/mealPlanController.js';

const router = express.Router();

router.get('/', getAllMealPlans);
router.post('/', createMealPlan);
router.delete('/:id', deleteMealPlan);

export default router;