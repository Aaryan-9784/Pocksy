/**
 * Transaction Model
 * Supports both income and expense entries
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  accountId?: mongoose.Types.ObjectId;
  toAccountId?: mongoose.Types.ObjectId;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
