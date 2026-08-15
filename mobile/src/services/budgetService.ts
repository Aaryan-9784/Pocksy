import { api } from './api';
import type { Budget, CategoryBudget } from '@/types';

export const budgetService = {
  async setBudget(
    month: number,
    year: number,
    amount: number,
    categoryBudgets?: CategoryBudget[]
  ): Promise<Budget> {
    const response = await api.post<Budget>('/budget', {
      month,
      year,
      amount,
      categoryBudgets,
    });
    return response.data!;
  },

  async set(payload: {
    month: number;
    year: number;
    amount?: number;
    categoryBudgets?: CategoryBudget[];
  }): Promise<Budget> {
    const response = await api.post<Budget>('/budget', payload);
    return response.data!;
  },

  async getBudget(month?: number, year?: number): Promise<{ budget: Budget }> {
    const params: Record<string, string | number | undefined> = { month, year };
    const response = await api.get<{ budget: Budget }>('/budget', params);
    return response.data!;
  },
};


