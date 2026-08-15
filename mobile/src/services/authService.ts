/**
 * Auth Service
 * API calls for authentication
 */

import { api } from './api';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', payload, false);
    return response.data!;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload, false);
    return response.data!;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data!;
  },
};
