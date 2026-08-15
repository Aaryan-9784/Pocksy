/**
 * Goal Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getGoals,
  createGoal,
  depositToGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController';

const router = Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.post('/:id/deposit', depositToGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
