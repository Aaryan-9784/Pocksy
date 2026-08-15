// Avoid circular static import with authStore
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Auto-detect API URL based on platform and environment
function getBaseUrl(): string {
  // 1. Explicit env variable (e.g. deployed backend URL on Render/Railway)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Custom app.json extra config (if not localhost)
  const extraApiUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (extraApiUrl && !extraApiUrl.includes('localhost') && !extraApiUrl.includes('127.0.0.1')) {
    return extraApiUrl;
  }

  const port = 5000;

  if (Platform.OS === 'web') {
    return `http://localhost:${port}/api`;
  }

  // 3. For Expo Go on physical device, use the debugger host IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) {
    return `http://${debuggerHost}:${port}/api`;
  }

  // 4. Fallback to your local computer's Wi-Fi IP
  const LOCAL_IP = '10.10.4.248';
  return `http://${LOCAL_IP}:${port}/api`;
}

const BASE_URL = getBaseUrl();

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | undefined>;
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiClient {
  private getToken(): string | null {
    try {
      const { useAuthStore } = require('@/store/authStore');
      return useAuthStore.getState().token;
    } catch {
      return null;
    }
  }


  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    if (!params) return url;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, params, requiresAuth = true } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = this.buildUrl(endpoint, params);

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: response.statusText || 'Server error' };
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Something went wrong',
        response.status
      );
    }

    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'GET', params, requiresAuth });
  }

  async post<T>(endpoint: string, body?: any, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T>(endpoint: string, body?: any, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = true) {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
