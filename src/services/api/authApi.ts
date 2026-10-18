/**
 * Chạm Đũa - Auth API
 * Endpoints: /api/auth/*
 */
import { apiClient } from './client';

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthUser {
  id: number;
  email?: string;
  phone?: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export const authApi = {
  // Login with Email & Password
  loginEmail: async (email: string, password: string, deviceName: string = 'WebApp') => {
    const res = await apiClient.post<TokenPair>('/api/auth/email/login', {
      email,
      password,
      deviceName,
    });
    if (res.ok && res.data?.accessToken) {
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },

  // Register with Email & Password
  registerEmail: async (email: string, password: string, confirmPassword: string, deviceName: string = 'WebApp') => {
    return apiClient.post('/api/auth/email/register', {
      email,
      password,
      confirmPassword,
      deviceName,
    });
  },

  // Login with Phone & Password
  loginPhone: async (phone: string, password: string, deviceName: string = 'WebApp') => {
    const res = await apiClient.post<TokenPair>('/api/auth/phone/login', {
      phone,
      password,
      deviceName,
    });
    if (res.ok && res.data?.accessToken) {
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },

  // Register with Phone & Password
  registerPhone: async (phone: string, password: string, confirmPassword: string, deviceName: string = 'WebApp') => {
    return apiClient.post('/api/auth/phone/register', {
      phone,
      password,
      confirmPassword,
      deviceName,
    });
  },

  // Social Login: Google
  loginGoogle: async (idToken: string, deviceName: string = 'WebApp') => {
    const res = await apiClient.post<TokenPair>('/api/auth/google', {
      idToken,
      deviceName,
    });
    if (res.ok && res.data?.accessToken) {
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },

  // Social Login: Facebook
  loginFacebook: async (accessToken: string, deviceName: string = 'WebApp') => {
    const res = await apiClient.post<TokenPair>('/api/auth/facebook', {
      accessToken,
      deviceName,
    });
    if (res.ok && res.data?.accessToken) {
      apiClient.setTokens(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  },

  // Get Current Authenticated User (/api/auth/me)
  getMe: async () => {
    return apiClient.get<AuthUser>('/api/auth/me');
  },

  // Logout current session
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      apiClient.clearTokens();
    }
  },

  // Logout all sessions
  logoutAll: async () => {
    try {
      await apiClient.post('/api/auth/logout-all');
    } finally {
      apiClient.clearTokens();
    }
  },
};
