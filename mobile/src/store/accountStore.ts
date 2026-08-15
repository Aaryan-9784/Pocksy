/**
 * Account Zustand Store
 */

import { create } from 'zustand';
import { accountService } from '@/services/accountService';
import type { Account, CreateAccountPayload, TransferPayload } from '@/types';

interface AccountState {
  accounts: Account[];
  totalBalance: number;
  loading: boolean;
  error: string | null;

  fetchAccounts: () => Promise<void>;
  createAccount: (payload: CreateAccountPayload) => Promise<Account>;
  updateAccount: (id: string, payload: Partial<CreateAccountPayload>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  transfer: (payload: TransferPayload) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  totalBalance: 0,
  loading: false,
  error: null,

  fetchAccounts: async () => {
    try {
      set({ loading: true, error: null });
      const res = await accountService.getAccounts();
      set({
        accounts: res.accounts || [],
        totalBalance: res.totalBalance || 0,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch accounts', loading: false });
    }
  },

  createAccount: async (payload) => {
    const newAccount = await accountService.createAccount(payload);
    await get().fetchAccounts();
    return newAccount;
  },

  updateAccount: async (id, payload) => {
    const updated = await accountService.updateAccount(id, payload);
    await get().fetchAccounts();
    return updated;
  },

  deleteAccount: async (id) => {
    await accountService.deleteAccount(id);
    await get().fetchAccounts();
  },

  transfer: async (payload) => {
    await accountService.transfer(payload);
    await get().fetchAccounts();
  },
}));
