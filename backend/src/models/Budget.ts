/**
 * Budget Model
 * Monthly budget per user
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryBudget {
  category: string;
  amount: number;
}

export interface IBudget extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  amount: number;
  categoryBudgets: ICategoryBudget[];
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2020,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative'],
      default: 0,
    },
    categoryBudgets: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Category budget amount cannot be negative'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Only one budget per user per month
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
