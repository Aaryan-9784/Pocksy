/**
 * Account Controller
 * Manages bank accounts, wallets, cash balances, and internal transfers
 */

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Account, IAccount } from '../models/Account';
import { Transaction } from '../models/Transaction';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

/**
 * GET /api/accounts
 * Get all accounts for current user (auto-seeds defaults if empty)
 */
export async function getAccounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    let accounts = await Account.find({ userId }).sort({ isDefault: -1, createdAt: 1 });

    if (accounts.length === 0) {
      // Auto seed default Cash & Bank accounts for new user
      const defaultAccounts = await Account.insertMany([
        {
          userId,
          name: 'Main Bank',
          type: 'bank',
          balance: 0,
          initialBalance: 0,
          color: '#2563EB',
          icon: 'business-outline',
          isDefault: true,
        },
        {
          userId,
          name: 'Cash Wallet',
          type: 'cash',
          balance: 0,
          initialBalance: 0,
          color: '#16A34A',
          icon: 'cash-outline',
          isDefault: false,
        },
      ]);
      accounts = defaultAccounts;
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    ApiResponse.success(res, 'Accounts retrieved', {
      accounts,
      totalBalance,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/accounts
 * Create a new account / wallet
 */
export async function createAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { name, type, balance = 0, accountNumber, color, icon } = req.body;

    if (!name) {
      throw ApiError.badRequest('Account name is required');
    }

    const account = await Account.create({
      userId,
      name,
      type: type || 'bank',
      balance: Number(balance) || 0,
      initialBalance: Number(balance) || 0,
      accountNumber,
      color: color || '#2563EB',
      icon: icon || 'wallet-outline',
    });

    ApiResponse.created(res, 'Account created successfully', account);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/accounts/:id
 * Update account details or balance
 */
export async function updateAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { name, type, balance, accountNumber, color, icon } = req.body;

    const account = await Account.findOneAndUpdate(
      { _id: id, userId },
      { $set: { ...(name && { name }), ...(type && { type }), ...(balance !== undefined && { balance: Number(balance) }), ...(accountNumber !== undefined && { accountNumber }), ...(color && { color }), ...(icon && { icon }) } },
      { new: true, runValidators: true }
    );

    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, 'Account updated successfully', account);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/accounts/:id
 * Delete account
 */
export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const account = await Account.findOneAndDelete({ _id: id, userId });
    if (!account) {
      throw ApiError.notFound('Account not found');
    }

    ApiResponse.success(res, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/accounts/transfer
 * Transfer funds between two user accounts
 */
export async function transferFunds(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!._id;
    const { fromAccountId, toAccountId, amount, date, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      throw ApiError.badRequest('Source account, destination account, and amount are required');
    }

    if (fromAccountId === toAccountId) {
      throw ApiError.badRequest('Source and destination accounts cannot be the same');
    }

    const transferAmount = Number(amount);
    if (transferAmount <= 0) {
      throw ApiError.badRequest('Transfer amount must be greater than 0');
    }

    const fromAcc = await Account.findOne({ _id: fromAccountId, userId });
    const toAcc = await Account.findOne({ _id: toAccountId, userId });

    if (!fromAcc || !toAcc) {
      throw ApiError.notFound('One or both accounts not found');
    }

    // Update balances
    fromAcc.balance -= transferAmount;
    toAcc.balance += transferAmount;

    await Promise.all([fromAcc.save(), toAcc.save()]);

    // Create a transfer transaction record
    const transferTransaction = await Transaction.create({
      userId,
      type: 'transfer',
      amount: transferAmount,
      category: 'transfer',
      description: description || `Transfer: ${fromAcc.name} ➔ ${toAcc.name}`,
      accountId: fromAcc._id,
      toAccountId: toAcc._id,
      date: date ? new Date(date) : new Date(),
    });

    ApiResponse.success(res, 'Transfer completed successfully', {
      transaction: transferTransaction,
      fromAccount: fromAcc,
      toAccount: toAcc,
    });
  } catch (error) {
    next(error);
  }
}
