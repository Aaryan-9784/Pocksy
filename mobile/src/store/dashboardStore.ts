/**
 * Pocksy Dashboard Store
 * Manages dashboard/home screen data
 */

import { create } from 'zustand';
import type { DashboardData } from '@/types';
import { dashboardService } from '@/services/dashboardService';

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  refresh: () => Promise<void>;
}

const initialData: DashboardData = {
  totalBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  monthlyBudget: 0,
  budgetSpent: 0,
  budgetRemaining: 0,
  budgetPercentage: 0,
  recentTransactions: [],
};

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dashboardService.getDashboard();
      set({ data, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message, data: initialData });
    }
  },

  refresh: async () => {
    try {
      const data = await dashboardService.getDashboard();
      set({ data });
    } catch {
      // Silent fail on refresh
    }
  },
}));
