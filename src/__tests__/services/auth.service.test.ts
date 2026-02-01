import { authService } from '@/services/auth.service';
import { STORAGE_KEYS, API_CONFIG } from '@/services/config';

describe('authService', () => {
  const localStorageMock = localStorage as jest.Mocked<typeof localStorage>;

  // Valid JWT payload for testing
  const mockIdToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    btoa(
      JSON.stringify({
        sub: 'user-123',
        'cognito:username': 'testuser',
        email: 'test@example.com',
        'custom:clinicId': 'clinic-1',
        'cognito:groups': ['admin'],
      })
    ).replace(/=/g, '') +
    '.signature';

  const mockTokens = {
    idToken: mockIdToken,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
  };

  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockTokens }),
      });

      const credentials = { username: 'testuser', password: 'password123' };
      const result = await authService.login(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.idToken,
        mockTokens.idToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.accessToken,
        mockTokens.accessToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.refreshToken,
        mockTokens.refreshToken
      );
      expect(result.tokens).toEqual(mockTokens);
      expect(result.user.username).toBe('testuser');
    });

    it('should throw error on login failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
      });

      const credentials = { username: 'testuser', password: 'wrongpassword' };

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should remove all stored tokens', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.idToken);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.accessToken);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.refreshToken);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.tokenExpiry);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.user);
    });
  });

  describe('getStoredUser', () => {
    it('should return user from localStorage', () => {
      const user = { sub: 'user-123', username: 'testuser' };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(user));

      const result = authService.getStoredUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = authService.getStoredUser();

      expect(result).toBeNull();
    });

    it('should return null when stored user is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const result = authService.getStoredUser();

      expect(result).toBeNull();
    });
  });

  describe('getStoredToken', () => {
    it('should return token from localStorage', () => {
      const token = 'test-token';
      localStorageMock.getItem.mockReturnValueOnce(token);

      const result = authService.getStoredToken();

      expect(result).toBe(token);
    });

    it('should return null when no token stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = authService.getStoredToken();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and not expired', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.idToken) return 'valid-token';
        if (key === STORAGE_KEYS.tokenExpiry) return String(Date.now() + 3600000);
        return null;
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token expired', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.idToken) return 'expired-token';
        if (key === STORAGE_KEYS.tokenExpiry) return String(Date.now() - 1000);
        return null;
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when token expiring within 5 minutes', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.idToken) return 'expiring-token';
        if (key === STORAGE_KEYS.tokenExpiry) return String(Date.now() + 60000); // 1 minute
        return null;
      });

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getTokenExpiry', () => {
    it('should return expiry timestamp', () => {
      const expiry = Date.now() + 3600000;
      localStorageMock.getItem.mockReturnValueOnce(String(expiry));

      const result = authService.getTokenExpiry();

      expect(result).toBe(expiry);
    });

    it('should return null when no expiry stored', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = authService.getTokenExpiry();

      expect(result).toBeNull();
    });
  });

  describe('refreshTokens', () => {
    const mockUser = {
      sub: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      clinicId: 'clinic-1',
      groups: ['admin'],
    };

    it('should refresh tokens successfully', async () => {
      const refreshedTokens = {
        idToken: mockIdToken,
        accessToken: 'new-access-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.refreshToken) return 'valid-refresh-token';
        if (key === STORAGE_KEYS.user) return JSON.stringify(mockUser);
        return null;
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: refreshedTokens }),
      });

      const result = await authService.refreshTokens();

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.refresh}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: 'valid-refresh-token', username: 'testuser' }),
        }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.idToken,
        refreshedTokens.idToken
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.accessToken,
        refreshedTokens.accessToken
      );
      expect(result).toEqual(refreshedTokens);
    });

    it('should throw error when no refresh token available', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await expect(authService.refreshTokens()).rejects.toThrow('No refresh token available');
    });

    it('should throw error when no username available', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.refreshToken) return 'valid-refresh-token';
        return null;
      });

      await expect(authService.refreshTokens()).rejects.toThrow('No username available for token refresh');
    });

    it('should logout and throw error when refresh fails', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.refreshToken) return 'expired-refresh-token';
        if (key === STORAGE_KEYS.user) return JSON.stringify(mockUser);
        return null;
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: { message: 'Invalid refresh token' } }),
      });

      await expect(authService.refreshTokens()).rejects.toThrow('Session expired. Please log in again.');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.idToken);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return true when token is expiring within 5 minutes', () => {
      localStorageMock.getItem.mockReturnValueOnce(String(Date.now() + 60000)); // 1 minute

      const result = authService.isTokenExpiringSoon();

      expect(result).toBe(true);
    });

    it('should return false when token has more than 5 minutes remaining', () => {
      localStorageMock.getItem.mockReturnValueOnce(String(Date.now() + 600000)); // 10 minutes

      const result = authService.isTokenExpiringSoon();

      expect(result).toBe(false);
    });

    it('should return true when no expiry set', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = authService.isTokenExpiringSoon();

      expect(result).toBe(true);
    });
  });
});
