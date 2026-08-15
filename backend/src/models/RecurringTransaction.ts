/**
 * Recurring Transaction / Subscription Model
 */

import mongoose, { Document, Schema } from 'mongoose';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IRecurringTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: Date;
  nextExecutionDate: Date;
  endDate?: Date;
  accountId?: mongoose.Types.ObjectId;
  active: boolean;
  autoCreate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      default: 'expense',
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
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    nextExecutionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
    },
    active: {
      type: Boolean,
      default: true,
    },
    autoCreate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

recurringTransactionSchema.index({ userId: 1, active: 1 });

export const RecurringTransaction = mongoose.model<IRecurringTransaction>(
  'RecurringTransaction',
  recurringTransactionSchema
);
