/**
 * Recurring Transaction Service
 */

import { api } from './api';
import type { RecurringTransaction, CreateRecurringPayload } from '@/types';

export const recurringService = {
  async getRecurring(): Promise<{
    recurring: RecurringTransaction[];
    monthlyRecurringExpense: number;
    monthlyRecurringIncome: number;
  }> {
    const response = await api.get<{
      recurring: RecurringTransaction[];
      monthlyRecurringExpense: number;
      monthlyRecurringIncome: number;
    }>('/recurring');
    return response.data!;
  },

  async create(payload: CreateRecurringPayload): Promise<RecurringTransaction> {
    const response = await api.post<RecurringTransaction>('/recurring', payload);
    return response.data!;
  },

  async update(id: string, payload: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    const response = await api.put<RecurringTransaction>(`/recurring/${id}`, payload);
    return response.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recurring/${id}`);
  },

  async execute(id: string): Promise<{ transaction: any; nextExecutionDate: string }> {
    const response = await api.post<any>(`/recurring/${id}/execute`, {});
    return response.data!;
  },
};
