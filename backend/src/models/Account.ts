/**
 * Account / Wallet Model
 * Supports Cash, Bank Accounts, Credit Cards, Digital Wallets, and Savings
 */

import mongoose, { Document, Schema } from 'mongoose';

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'wallet' | 'savings';

export interface IAccount extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  accountNumber?: string;
  color?: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [50, 'Account name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: ['cash', 'bank', 'credit_card', 'wallet', 'savings'],
      default: 'bank',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    initialBalance: {
      type: Number,
      default: 0,
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: [30, 'Account number cannot exceed 30 characters'],
    },
    color: {
      type: String,
      default: '#2563EB',
    },
    icon: {
      type: String,
      default: 'wallet-outline',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ userId: 1, name: 1 });

export const Account = mongoose.model<IAccount>('Account', accountSchema);
