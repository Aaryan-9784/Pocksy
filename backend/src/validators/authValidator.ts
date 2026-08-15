/**
 * Auth Request Validators
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function validateRegister(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { name, email, password, confirmPassword } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please enter a valid email');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join('. ')));
  }

  next();
}

export function validateLogin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please enter a valid email');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest(errors.join('. ')));
  }

  next();
}
