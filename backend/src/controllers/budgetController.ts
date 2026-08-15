/**
 * Budget Controller
 * Set and retrieve monthly budgets
 */

import { Request, Response, NextFunction } from 'express';
import { Budget } from '../models/Budget';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * POST /api/budget
 * Create or update budget for a given month/year
 */
export async function setBudget(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { month, year, amount, categoryBudgets } = req.body;

    if (!month || !year) {
      throw ApiError.badRequest('Month and year are required');
    }

    if (month < 1 || month > 12) {
      throw ApiError.badRequest('Month must be between 1 and 12');
    }

    const updateDoc: any = {};
    if (amount !== undefined) {
      if (amount < 0) {
        throw ApiError.badRequest('Budget amount cannot be negative');
      }
      updateDoc.amount = amount;
    }

    if (Array.isArray(categoryBudgets)) {
      updateDoc.categoryBudgets = categoryBudgets.filter(
        (cb: any) => cb.category && typeof cb.amount === 'number' && cb.amount >= 0
      );
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user!._id, month, year },
      { $set: updateDoc },
      { new: true, upsert: true, runValidators: true }
    );

    ApiResponse.success(res, 'Budget set successfully', budget);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/budget
 * Get budget for a specific month/year (defaults to current)
 * Query params: month, year
 */
export async function getBudget(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const budget = await Budget.findOne({
      userId: req.user!._id,
      month,
      year,
    }).lean();

    ApiResponse.success(res, 'Budget retrieved', {
      budget: budget || { month, year, amount: 0, categoryBudgets: [] },
    });
  } catch (error) {
    next(error);
  }
}
