/**
 * Account Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  transferFunds,
} from '../controllers/accountController';

const router = Router();

// Protect all account routes
router.use(protect);

router.get('/', getAccounts);
router.post('/', createAccount);
router.post('/transfer', transferFunds);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
