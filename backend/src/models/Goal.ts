/**
 * Financial Goal / Savings Pot Model
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  category?: string;
  color?: string;
  icon?: string;
  status: 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    targetDate: {
      type: Date,
    },
    category: {
      type: String,
      default: 'savings',
    },
    color: {
      type: String,
      default: '#16A34A',
    },
    icon: {
      type: String,
      default: 'trophy-outline',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ userId: 1, status: 1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
