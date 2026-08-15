/**
 * Goal Service
 */

import { api } from './api';
import type { Goal, CreateGoalPayload } from '@/types';

export const goalService = {
  async getGoals(): Promise<{
    goals: Goal[];
    totalTarget: number;
    totalSaved: number;
    overallProgress: number;
  }> {
    const response = await api.get<{
      goals: Goal[];
      totalTarget: number;
      totalSaved: number;
      overallProgress: number;
    }>('/goals');
    return response.data!;
  },

  async create(payload: CreateGoalPayload): Promise<Goal> {
    const response = await api.post<Goal>('/goals', payload);
    return response.data!;
  },

  async deposit(id: string, amount: number): Promise<Goal> {
    const response = await api.post<Goal>(`/goals/${id}/deposit`, { amount });
    return response.data!;
  },

  async update(id: string, payload: Partial<Goal>): Promise<Goal> {
    const response = await api.put<Goal>(`/goals/${id}`, payload);
    return response.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
