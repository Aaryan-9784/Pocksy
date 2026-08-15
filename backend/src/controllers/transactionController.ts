/**
 * Transaction Controller
 * CRUD operations for income and expense transactions
 */

import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * POST /api/transactions
 * Create a new transaction
 */
export async function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, amount, category, description, paymentMethod, date, notes } = req.body;

    const transaction = await Transaction.create({
      userId: req.user!._id,
      type,
      amount,
      category,
      description,
      paymentMethod,
      date: new Date(date),
      notes,
    });

    ApiResponse.created(res, 'Transaction created successfully', transaction);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/transactions
 * List transactions with optional filters and pagination
 * Query params: type, category, startDate, endDate, page, limit, sort
 */
export async function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = '1',
      limit = '20',
      sort = '-date',
    } = req.query;

    // Build filter
    const filter: Record<string, any> = { userId: req.user!._id };

    if (type && (type === 'income' || type === 'expense')) {
      filter.type = type;
    }

    if (category && typeof category === 'string') {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Transactions retrieved', {
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
export async function getTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    ApiResponse.success(res, 'Transaction retrieved', transaction);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
export async function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, amount, category, description, paymentMethod, date, notes } = req.body;

    const updateData: Record<string, any> = {};
    if (type) updateData.type = type;
    if (amount) updateData.amount = amount;
    if (category) updateData.category = category;
    if (description) updateData.description = description;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (date) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    ApiResponse.success(res, 'Transaction updated', transaction);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
export async function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    ApiResponse.success(res, 'Transaction deleted');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/transactions/export
 * Export user transactions as CSV
 */
export async function exportTransactions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const transactions = await Transaction.find({ userId: req.user!._id })
      .sort({ date: -1 })
      .lean();

    const csvRows: string[] = [
      'Date,Type,Category,Description,Amount,Payment Method,Notes',
    ];

    for (const t of transactions) {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      const typeStr = t.type;
      const categoryStr = `"${(t.category || '').replace(/"/g, '""')}"`;
      const descStr = `"${(t.description || '').replace(/"/g, '""')}"`;
      const amountStr = t.amount.toString();
      const methodStr = `"${(t.paymentMethod || '').replace(/"/g, '""')}"`;
      const notesStr = `"${(t.notes || '').replace(/"/g, '""')}"`;

      csvRows.push([dateStr, typeStr, categoryStr, descStr, amountStr, methodStr, notesStr].join(','));
    }

    const csvContent = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pocksy_transactions.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

