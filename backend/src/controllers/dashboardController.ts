/**
 * Dashboard Controller
 * Aggregates financial overview for current month
 */

import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { Budget } from '../models/Budget';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * GET /api/dashboard
 * Get dashboard summary for current month
 */
export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Start and end of current month
    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Aggregate income and expenses for current month
    const [aggregation, recentTransactions, budget] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
      Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      Budget.findOne({ userId, month: currentMonth, year: currentYear }).lean(),
    ]);

    // Extract totals
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const entry of aggregation) {
      if (entry._id === 'income') totalIncome = entry.total;
      if (entry._id === 'expense') totalExpenses = entry.total;
    }

    const totalBalance = totalIncome - totalExpenses;
    const monthlyBudget = budget?.amount || req.user!.monthlyBudget || 0;
    const budgetSpent = totalExpenses;
    const budgetRemaining = Math.max(0, monthlyBudget - budgetSpent);
    const budgetPercentage = monthlyBudget > 0
      ? Math.min(100, Math.round((budgetSpent / monthlyBudget) * 100))
      : 0;

    ApiResponse.success(res, 'Dashboard data retrieved', {
      totalBalance,
      totalIncome,
      totalExpenses,
      monthlyBudget,
      budgetSpent,
      budgetRemaining,
      budgetPercentage,
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
}
