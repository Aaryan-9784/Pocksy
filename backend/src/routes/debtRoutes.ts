/**
 * Debt Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  getDebts,
  createDebt,
  settleDebt,
  deleteDebt,
} from '../controllers/debtController';

const router = Router();

router.use(protect);

router.get('/', getDebts);
router.post('/', createDebt);
router.post('/:id/settle', settleDebt);
router.delete('/:id', deleteDebt);

export default router;
