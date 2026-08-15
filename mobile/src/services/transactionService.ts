/**
 * Transaction Service
 * API calls for transaction CRUD operations
 */

import { api } from './api';
import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from '@/types';

interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const transactionService = {
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', payload);
    return response.data!;
  },

  async list(filters: TransactionFilters = {}): Promise<TransactionListResponse> {
    const params: Record<string, string | number | undefined> = {
      type: filters.type,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
    };
    const response = await api.get<TransactionListResponse>('/transactions', params);
    return response.data!;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data!;
  },

  async update(id: string, payload: UpdateTransactionPayload): Promise<Transaction> {
    const response = await api.put<Transaction>(`/transactions/${id}`, payload);
    return response.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async exportCsv(): Promise<string> {
    const data = await this.list({ limit: 1000 });
    const rows = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'].join(','),
    ];

    for (const t of data.transactions) {
      const dateStr = new Date(t.date).toLocaleDateString();
      const typeStr = t.type.toUpperCase();
      const categoryStr = `"${(t.category || '').replace(/"/g, '""')}"`;
      const descStr = `"${(t.description || '').replace(/"/g, '""')}"`;
      const amountStr = t.amount.toString();
      const methodStr = `"${(t.paymentMethod || 'Other').replace(/"/g, '""')}"`;
      const notesStr = `"${(t.notes || '').replace(/"/g, '""')}"`;

      rows.push([dateStr, typeStr, categoryStr, descStr, amountStr, methodStr, notesStr].join(','));
    }

    return rows.join('\n');
  },
};

