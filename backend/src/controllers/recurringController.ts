/**
 * Recurring Transaction Controller
 * Subscriptions, SIPs, Rent, and automated billing
 */

import { Request, Response, NextFunction } from 'express';
import { RecurringTransaction } from '../models/RecurringTransaction';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

function calculateNextDate(currentDate: Date, frequency: string): Date {
  const d = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
  }
  return d;
}

/**
 * GET /api/recurring
 * Get user's recurring transactions & total monthly commitment
 */
export async function getRecurringTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const items = await RecurringTransaction.find({ userId })
      .sort({ nextExecutionDate: 1 })
      .lean();

    // Calculate monthly normalized committed amount
    let monthlyRecurringExpense = 0;
    let monthlyRecurringIncome = 0;

    for (const item of items) {
      if (!item.active) continue;
      let monthlyAmt = item.amount;
      if (item.frequency === 'daily') monthlyAmt = item.amount * 30;
      else if (item.frequency === 'weekly') monthlyAmt = item.amount * 4.33;
      else if (item.frequency === 'yearly') monthlyAmt = item.amount / 12;

      if (item.type === 'expense') {
        monthlyRecurringExpense += monthlyAmt;
      } else {
        monthlyRecurringIncome += monthlyAmt;
      }
    }

    ApiResponse.success(res, 'Recurring transactions retrieved', {
      recurring: items,
      monthlyRecurringExpense: Math.round(monthlyRecurringExpense),
      monthlyRecurringIncome: Math.round(monthlyRecurringIncome),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recurring
 * Create a new recurring transaction / subscription
 */
export async function createRecurringTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const {
      type = 'expense',
      amount,
      category,
      description,
      frequency = 'monthly',
      startDate,
      endDate,
      accountId,
      autoCreate = false,
    } = req.body;

    if (!amount || !category || !description) {
      throw ApiError.badRequest('Amount, category, and description are required');
    }

    const start = startDate ? new Date(startDate) : new Date();

    const recurring = await RecurringTransaction.create({
      userId,
      type,
      amount: Number(amount),
      category,
      description,
      frequency,
      startDate: start,
      nextExecutionDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
      active: true,
      autoCreate,
    });

    ApiResponse.created(res, 'Recurring transaction created successfully', recurring);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/recurring/:id
 * Update recurring transaction
 */
export async function updateRecurringTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!recurring) {
      throw ApiError.notFound('Recurring transaction not found');
    }

    ApiResponse.success(res, 'Recurring transaction updated', recurring);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/recurring/:id
 * Delete recurring transaction
 */
export async function deleteRecurringTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOneAndDelete({ _id: id, userId });
    if (!recurring) {
      throw ApiError.notFound('Recurring transaction not found');
    }

    ApiResponse.success(res, 'Recurring transaction deleted');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/recurring/:id/execute
 * Execute / Log this recurring transaction now into transactions
 */
export async function executeRecurringTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const recurring = await RecurringTransaction.findOne({ _id: id, userId });
    if (!recurring) {
      throw ApiError.notFound('Recurring transaction not found');
    }

    // 1. Create real transaction
    const transaction = await Transaction.create({
      userId,
      type: recurring.type,
      amount: recurring.amount,
      category: recurring.category,
      description: `${recurring.description} (Subscription)`,
      accountId: recurring.accountId,
      date: new Date(),
    });

    // 2. Adjust account balance if accountId exists
    if (recurring.accountId) {
      if (recurring.type === 'income') {
        await Account.findByIdAndUpdate(recurring.accountId, { $inc: { balance: recurring.amount } });
      } else {
        await Account.findByIdAndUpdate(recurring.accountId, { $inc: { balance: -recurring.amount } });
      }
    }

    // 3. Advance next execution date
    recurring.nextExecutionDate = calculateNextDate(recurring.nextExecutionDate, recurring.frequency);
    await recurring.save();

    ApiResponse.success(res, 'Recurring transaction executed and logged', {
      transaction,
      nextExecutionDate: recurring.nextExecutionDate,
    });
  } catch (error) {
    next(error);
  }
}
