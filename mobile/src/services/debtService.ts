/**
 * Debt & Lending Service
 */

import { api } from './api';
import type { Debt, CreateDebtPayload } from '@/types';

export const debtService = {
  async getDebts(): Promise<{
    debts: Debt[];
    totalLent: number;
    totalBorrowed: number;
    netBalance: number;
  }> {
    const response = await api.get<{
      debts: Debt[];
      totalLent: number;
      totalBorrowed: number;
      netBalance: number;
    }>('/debts');
    return response.data!;
  },

  async create(payload: CreateDebtPayload): Promise<Debt> {
    const response = await api.post<Debt>('/debts', payload);
    return response.data!;
  },

  async settle(id: string, amount?: number): Promise<Debt> {
    const response = await api.post<Debt>(`/debts/${id}/settle`, { amount });
    return response.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/debts/${id}`);
  },
};
