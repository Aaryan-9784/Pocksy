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
  data: initialData,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    try {
      const data = await dashboardService.getDashboard();
      set({ data, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  refresh: async () => {
    try {
      const data = await dashboardService.getDashboard();
      set({ data, error: null });
    } catch {
      // Silent fail on refresh
    }
  },
}));
