/**
 * Budget Service
 * API calls for budget management
 */

import { api } from './api';
import type { Budget } from '@/types';

export const budgetService = {
  async setBudget(month: number, year: number, amount: number): Promise<Budget> {
    const response = await api.post<Budget>('/budget', { month, year, amount });
    return response.data!;
  },

  async getBudget(month?: number, year?: number): Promise<{ budget: Budget }> {
    const params: Record<string, string | number | undefined> = { month, year };
    const response = await api.get<{ budget: Budget }>('/budget', params);
    return response.data!;
  },
};
