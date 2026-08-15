/**
 * Transaction Request Validators
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const VALID_TYPES = ['income', 'expense'];

export function validateCreateTransaction(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { type, amount, category, description, date } = req.body;
  const errors: string[] = [];

  if (!type || !VALID_TYPES.includes(type)) {
    errors.push('Type must be "income" or "expense"');
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!date) {
    errors.push('Date is required');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join('. ')));
  }

  next();
}

export function validateUpdateTransaction(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { type, amount } = req.body;
  const errors: string[] = [];

  if (type && !VALID_TYPES.includes(type)) {
    errors.push('Type must be "income" or "expense"');
  }

  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    errors.push('Amount must be a positive number');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join('. ')));
  }

  next();
}
