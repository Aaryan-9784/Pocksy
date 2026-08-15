/**
 * Debt & Lending (IOU / Udhaar) Model
 */

import mongoose, { Document, Schema } from 'mongoose';

export type DebtType = 'lent' | 'borrowed';

export interface IDebt extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: DebtType;
  personName: string;
  amount: number;
  remainingAmount: number;
  dueDate?: Date;
  notes?: string;
  settled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const debtSchema = new Schema<IDebt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['lent', 'borrowed'],
      required: [true, 'Debt type is required'],
    },
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [100, 'Person name cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: [0, 'Remaining amount cannot be negative'],
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    settled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

debtSchema.index({ userId: 1, settled: 1 });

export const Debt = mongoose.model<IDebt>('Debt', debtSchema);
