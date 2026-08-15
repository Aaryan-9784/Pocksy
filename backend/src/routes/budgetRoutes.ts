/**
 * Budget Routes
 */

import { Router } from 'express';
import { setBudget, getBudget } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', setBudget);
router.get('/', getBudget);

export default router;
