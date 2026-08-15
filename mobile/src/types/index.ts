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

export interface UpdateProfilePayload {
  name?: string;
  currency?: string;
  monthlyBudget?: number;
}


// ─── Transactions ────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  paymentMethod?: string;
  accountId?: string;
  toAccountId?: string;
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
  accountId?: string;
  toAccountId?: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
}

export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface CategoryBudget {
  category: string;
  amount: number;
}

export interface Budget {
  _id?: string;
  userId?: string;
  month: number;
  year: number;
  amount: number;
  categoryBudgets?: CategoryBudget[];
  createdAt?: string;
  updatedAt?: string;
}

// ─── Accounts & Wallets ───────────────────────────────────────────────────────

export type AccountType = 'cash' | 'bank' | 'credit_card' | 'wallet' | 'savings';

export interface Account {
  _id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  accountNumber?: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  color?: string;
  icon?: string;
}

export interface TransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date?: string;
  description?: string;
}

// ─── Recurring Transaction / Subscriptions ───────────────────────────────────

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
  accountId?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecurringPayload {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  accountId?: string;
}

// ─── Financial Goals & Savings Pots ──────────────────────────────────────────

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  color?: string;
  icon?: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  category?: string;
  color?: string;
  icon?: string;
}

// ─── Debt & Lending (Udhaar / IOU) ────────────────────────────────────────────

export type DebtType = 'lent' | 'borrowed';

export interface Debt {
  _id: string;
  userId: string;
  type: DebtType;
  personName: string;
  amount: number;
  remainingAmount: number;
  dueDate?: string;
  notes?: string;
  settled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtPayload {
  type: DebtType;
  personName: string;
  amount: number;
  dueDate?: string;
  notes?: string;
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
