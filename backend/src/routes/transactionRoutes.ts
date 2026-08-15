/**
 * Transaction Routes
 */

import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';
import {
  validateCreateTransaction,
  validateUpdateTransaction,
} from '../validators/transactionValidator';

const router = Router();

// All routes are protected
router.use(protect);

router.post('/', validateCreateTransaction, createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.put('/:id', validateUpdateTransaction, updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
