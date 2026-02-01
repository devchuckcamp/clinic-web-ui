import { API_CONFIG, STORAGE_KEYS } from './config';
import { authService } from './auth.service';
import type { ApiResponse, ApiError } from '@/types';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.idToken);
  }

  private async ensureValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    // Check if token is expiring soon and refresh proactively
    if (authService.isTokenExpiringSoon()) {
      try {
        await authService.refreshTokens();
        return this.getToken();
      } catch {
        // If refresh fails, return null - request will fail with 401
        return null;
      }
    }

    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const token = await this.ensureValidToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 204 No Content responses (e.g., DELETE)
    if (response.status === 204) {
      return undefined as T;
    }

    // Handle 401 Unauthorized - attempt token refresh and retry once
    if (response.status === 401 && !isRetry) {
      try {
        await authService.refreshTokens();
        return this.request<T>(endpoint, options, true);
      } catch {
        // Refresh failed - throw the original error
        throw new Error('Session expired. Please log in again.');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.error?.message || 'An error occurred');
    }

    return (data as ApiResponse<T>).data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Direct fetch for file uploads (no JSON processing)
  async uploadFile(url: string, file: File, contentType: string): Promise<void> {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }
  }
}

export const apiClient = new ApiClient();
