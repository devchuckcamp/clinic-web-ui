import { API_CONFIG, STORAGE_KEYS } from './config';
import type { AuthTokens, LoginCredentials, User } from '@/types';

interface RefreshResponse {
  idToken: string;
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

function parseJwt(token: string): Record<string, unknown> {
  const base64Url = token.split('.')[1];
  if (!base64Url) throw new Error('Invalid token');

  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function extractUserFromToken(idToken: string): User {
  const claims = parseJwt(idToken);
  return {
    sub: claims.sub as string,
    username: claims['cognito:username'] as string,
    email: claims.email as string,
    clinicId: claims['custom:clinicId'] as string,
    groups: (claims['cognito:groups'] as string[]) || [],
  };
}

// Track if a refresh is in progress to prevent concurrent refreshes
let refreshPromise: Promise<RefreshResponse> | null = null;

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error?.message || 'Login failed');
    }

    const result = await response.json();
    const tokens = result.data as AuthTokens;

    const user = extractUserFromToken(tokens.idToken);

    // Store tokens
    localStorage.setItem(STORAGE_KEYS.idToken, tokens.idToken);
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    localStorage.setItem(STORAGE_KEYS.tokenExpiry, String(Date.now() + tokens.expiresIn * 1000));
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

    return { tokens, user };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.idToken);
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
    localStorage.removeItem(STORAGE_KEYS.user);
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.user);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.idToken);
  },

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);

    if (!token || !expiry) return false;

    // Check if token is expired (with 5 minute buffer)
    return Date.now() < Number(expiry) - 5 * 60 * 1000;
  },

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);
    return expiry ? Number(expiry) : null;
  },

  getStoredRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  },

  async refreshTokens(): Promise<RefreshResponse> {
    // If a refresh is already in progress, return that promise to prevent concurrent refreshes
    if (refreshPromise) {
      return refreshPromise;
    }

    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const user = this.getStoredUser();
    if (!user?.username) {
      throw new Error('No username available for token refresh');
    }

    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.refresh}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, username: user.username }),
        });

        if (!response.ok) {
          // Refresh token is invalid/expired - clear auth state
          this.logout();
          throw new Error('Session expired. Please log in again.');
        }

        const result = await response.json();
        const tokens = result.data as RefreshResponse;

        // Update stored tokens
        localStorage.setItem(STORAGE_KEYS.idToken, tokens.idToken);
        localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
        localStorage.setItem(STORAGE_KEYS.tokenExpiry, String(Date.now() + tokens.expiresIn * 1000));

        // Update user from new token
        const updatedUser = extractUserFromToken(tokens.idToken);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

        return tokens;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    // Consider token expiring if less than 5 minutes remaining
    return Date.now() > expiry - 5 * 60 * 1000;
  },
};
