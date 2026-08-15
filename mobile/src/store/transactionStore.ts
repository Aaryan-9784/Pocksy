/**
 * Pocksy Transaction Store
 * Manages transaction list state and CRUD operations
 */

import { create } from 'zustand';
import type { Transaction, CreateTransactionPayload } from '@/types';
import { transactionService } from '@/services/transactionService';

interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  filters: TransactionFilters;

  // Actions
  fetchTransactions: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  addTransaction: (payload: CreateTransactionPayload) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (filters: TransactionFilters) => void;
  refresh: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  page: 1,
  totalPages: 1,
  filters: {},

  fetchTransactions: async (reset = false) => {
    const state = get();
    if (state.isLoading) return;

    const page = reset ? 1 : state.page;
    set({ isLoading: true, error: null });

    try {
      const data = await transactionService.list({
        ...state.filters,
        page,
        limit: 20,
        sort: '-date',
      });

      set({
        transactions: reset
          ? data.transactions
          : [...state.transactions, ...data.transactions],
        page: data.pagination.page,
        totalPages: data.pagination.pages,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  loadMore: async () => {
    const state = get();
    if (state.isLoading || state.page >= state.totalPages) return;

    set({ page: state.page + 1 });
    await get().fetchTransactions();
  },

  addTransaction: async (payload: CreateTransactionPayload) => {
    const transaction = await transactionService.create(payload);
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    }));
    return transaction;
  },

  deleteTransaction: async (id: string) => {
    await transactionService.delete(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t._id !== id),
    }));
  },

  setFilter: (filters: TransactionFilters) => {
    set({ filters, page: 1 });
    get().fetchTransactions(true);
  },

  refresh: async () => {
    set({ isRefreshing: true });
    await get().fetchTransactions(true);
    set({ isRefreshing: false });
  },
}));
