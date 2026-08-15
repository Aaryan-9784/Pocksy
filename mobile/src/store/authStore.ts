/**
 * Pocksy Auth Store
 * Manages authentication state with Zustand
 * Token persisted in expo-secure-store, onboarding flag in AsyncStorage
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { User, LoginPayload, RegisterPayload } from '@/types';
import { authService } from '@/services/authService';

const TOKEN_KEY = 'pocksy_auth_token';
const ONBOARDING_KEY = 'pocksy_has_seen_onboarding';
const USER_KEY = 'pocksy_auth_user';

// SecureStore is not available on web, use localStorage fallback
async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  error: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (payload: { name?: string; currency?: string; monthlyBudget?: number }) => Promise<void>;
  setOnboardingComplete: () => Promise<void>;
  logout: () => Promise<void>;
  loadPersistedState: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  hasSeenOnboarding: false,
  error: null,

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(payload);
      await saveToken(token);
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true, hasSeenOnboarding: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(payload);
      await saveToken(token);
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, isAuthenticated: true, hasSeenOnboarding: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  fetchUser: async () => {
    try {
      const user = await authService.getMe();
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch (err: any) {
      // Only logout on genuine 401 (token invalid/expired)
      // Do NOT logout on network errors, timeouts, or server cold starts
      const isAuthError = err?.statusCode === 401 || err?.statusCode === 403;
      const isNetworkError =
        !err?.statusCode ||
        err?.message?.includes('Network request failed') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('timeout');

      if (isAuthError && !isNetworkError) {
        await get().logout();
      }
      // On network errors, silently keep user logged in with cached data
    }
  },

  updateProfile: async (payload) => {
    try {
      const updatedUser = await authService.updateProfile(payload);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err: any) {
      throw err;
    }
  },

  setOnboardingComplete: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    set({ hasSeenOnboarding: true });
  },

  logout: async () => {
    try {
      await deleteToken();
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Error deleting token:', e);
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasSeenOnboarding: true,
      error: null,
      isLoading: false,
    });
  },

  loadPersistedState: async () => {
    try {
      const [token, hasSeenOnboardingStr, userStr] = await Promise.all([
        getToken(),
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      const hasSeenOnboarding = hasSeenOnboardingStr === 'true';
      let parsedUser: User | null = null;
      if (userStr) {
        try {
          parsedUser = JSON.parse(userStr);
        } catch {}
      }

      if (token) {
        set({
          token,
          user: parsedUser,
          isAuthenticated: true,
          hasSeenOnboarding: true,
          isLoading: false,
        });
        // Refresh profile in background without blocking screen
        get().fetchUser().catch(() => {});
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          hasSeenOnboarding,
          isLoading: false,
        });
      }
    } catch {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
