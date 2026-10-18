/**
 * Chạm Đũa - API Client for AWS ALB Backend
 * Swagger: http://chamdua-alb-1535650319.ap-southeast-1.elb.amazonaws.com/swagger/index.html
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://chamdua-alb-1535650319.ap-southeast-1.elb.amazonaws.com';

const TOKEN_KEYS = {
  ACCESS_TOKEN: 'chamdua_access_token',
  REFRESH_TOKEN: 'chamdua_refresh_token',
};

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    status: number;
    title?: string;
    detail?: string;
  };
  ok: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  public setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  public clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  public async checkHealth(): Promise<{ status: string; time: string; latencyMs: number } | null> {
    const start = performance.now();
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const json = await res.json();
        return { status: json.status || 'Healthy', time: json.time || new Date().toISOString(), latencyMs };
      }
      return null;
    } catch {
      return null;
    }
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let res = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 & Refresh Token
      if (res.status === 401 && this.getRefreshToken() && !endpoint.includes('/api/auth/refresh')) {
        const refreshSuccess = await this.tryRefreshToken();
        if (refreshSuccess) {
          const newToken = this.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(url, {
              ...options,
              headers,
            });
          }
        }
      }

      if (res.status === 204) {
        return { ok: true };
      }

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) {
        return {
          ok: false,
          error: {
            status: res.status,
            title: data?.title || 'API_ERROR',
            detail: data?.detail || res.statusText || 'Có lỗi xảy ra khi gọi máy chủ',
          },
        };
      }

      return {
        ok: true,
        data,
      };
    } catch (err: any) {
      return {
        ok: false,
        error: {
          status: 0,
          title: 'NETWORK_ERROR',
          detail: err?.message || 'Không thể kết nối đến máy chủ API AWS Chạm Đũa',
        },
      };
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.accessToken) {
          this.setTokens(json.accessToken, json.refreshToken);
          return true;
        }
      }
      this.clearTokens();
      return false;
    } catch {
      return false;
    }
  }

  // HTTP Helpers
  public get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
