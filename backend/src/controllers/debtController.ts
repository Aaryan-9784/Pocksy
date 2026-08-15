/**
 * Debt & Lending (IOU) Controller
 * Manage lent money, borrowed loans, and settle ups
 */

import { Request, Response, NextFunction } from 'express';
import { Debt } from '../models/Debt';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * GET /api/debts
 * Get all debts with totals summary
 */
export async function getDebts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const debts = await Debt.find({ userId }).sort({ settled: 1, createdAt: -1 });

    let totalLent = 0; // People owe me
    let totalBorrowed = 0; // I owe people

    for (const d of debts) {
      if (!d.settled) {
        if (d.type === 'lent') {
          totalLent += d.remainingAmount;
        } else {
          totalBorrowed += d.remainingAmount;
        }
      }
    }

    ApiResponse.success(res, 'Debts retrieved', {
      debts,
      totalLent,
      totalBorrowed,
      netBalance: totalLent - totalBorrowed,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/debts
 * Create a new debt / lending entry
 */
export async function createDebt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { type, personName, amount, dueDate, notes } = req.body;

    if (!type || !personName || !amount) {
      throw ApiError.badRequest('Type, person name, and amount are required');
    }

    const debt = await Debt.create({
      userId,
      type,
      personName: personName.trim(),
      amount: Number(amount),
      remainingAmount: Number(amount),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes?.trim(),
      settled: false,
    });

    ApiResponse.created(res, 'Debt record created successfully', debt);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/debts/:id/settle
 * Settle up / record payment for a debt
 */
export async function settleDebt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { amount } = req.body; // Optional partial settle amount; if omitted, settles full remaining

    const debt = await Debt.findOne({ _id: id, userId });
    if (!debt) {
      throw ApiError.notFound('Debt record not found');
    }

    if (amount !== undefined) {
      const payAmount = Number(amount);
      debt.remainingAmount = Math.max(0, debt.remainingAmount - payAmount);
      if (debt.remainingAmount === 0) {
        debt.settled = true;
      }
    } else {
      debt.remainingAmount = 0;
      debt.settled = true;
    }

    await debt.save();

    ApiResponse.success(res, 'Debt updated successfully', debt);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/debts/:id
 * Delete debt record
 */
export async function deleteDebt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const debt = await Debt.findOneAndDelete({ _id: id, userId });
    if (!debt) {
      throw ApiError.notFound('Debt record not found');
    }

    ApiResponse.success(res, 'Debt record deleted successfully');
  } catch (error) {
    next(error);
  }
}
