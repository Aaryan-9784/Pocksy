/**
 * Recurring Transaction Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
} from '../controllers/recurringController';

const router = Router();

router.use(protect);

router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);
router.post('/:id/execute', executeRecurringTransaction);

export default router;
