/**
 * Account Service
 * Handles API calls for wallets, bank accounts, and internal transfers
 */

import { api } from './api';
import type { Account, CreateAccountPayload, TransferPayload } from '@/types';

export const accountService = {
  async getAccounts(): Promise<{ accounts: Account[]; totalBalance: number }> {
    const response = await api.get<{ accounts: Account[]; totalBalance: number }>('/accounts');
    return response.data!;
  },

  async createAccount(payload: CreateAccountPayload): Promise<Account> {
    const response = await api.post<Account>('/accounts', payload);
    return response.data!;
  },

  async updateAccount(id: string, payload: Partial<CreateAccountPayload>): Promise<Account> {
    const response = await api.put<Account>(`/accounts/${id}`, payload);
    return response.data!;
  },

  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  },

  async transfer(payload: TransferPayload): Promise<{
    transaction: any;
    fromAccount: Account;
    toAccount: Account;
  }> {
    const response = await api.post<any>('/accounts/transfer', payload);
    return response.data!;
  },
};
