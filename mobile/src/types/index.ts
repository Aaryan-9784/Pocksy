/**
 * Pocksy Core Types
 */

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  currency: string;
  monthlyBudget: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Transactions ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  date: string;
  notes?: string;
}

export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface Budget {
  _id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Recurring Transaction (future) ──────────────────────────────────────────

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextExecutionDate: string;
  active: boolean;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
  budgetPercentage: number;
  recentTransactions: Transaction[];
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
