import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services';
import { clinicService } from '@/services/clinic.service';

jest.mock('@/services', () => ({
  authService: {
    isAuthenticated: jest.fn(),
    getStoredUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/services/clinic.service', () => ({
  clinicService: {
    getClinic: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockClinicService = clinicService as jest.Mocked<typeof clinicService>;

// Test component to access context
function TestComponent() {
  const { user, clinic, isAuthenticated, isLoading, error, login, logout, clearError } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <div data-testid="user">{user?.username || 'none'}</div>
      <div data-testid="clinic">{clinic?.name || 'none'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <button onClick={() => login({ username: 'test', password: 'pass' })}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.getStoredUser.mockReturnValue(null);
    mockClinicService.getClinic.mockResolvedValue({ clinicId: 'clinic-1', name: 'Test Clinic' });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should initialize with loading state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  it('should restore session from storage on mount', async () => {
    const storedUser = { sub: '123', username: 'storeduser', email: 'test@test.com', clinicId: 'c1', groups: [] };
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getStoredUser.mockReturnValue(storedUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('storeduser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('yes');
    });
  });

  it('should login successfully', async () => {
    const user = userEvent.setup();
    const mockUser = { sub: '123', username: 'testuser', email: 'test@test.com', clinicId: 'c1', groups: [] };
    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      tokens: { idToken: 't', accessToken: 'a', refreshToken: 'r', expiresIn: 3600, tokenType: 'Bearer' }
    });
    mockAuthService.isAuthenticated.mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockImplementation(() => Promise.reject(new Error('Invalid credentials')));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup();
    const mockUser = { sub: '123', username: 'testuser', email: 'test@test.com', clinicId: 'c1', groups: [] };
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getStoredUser.mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    mockAuthService.isAuthenticated.mockReturnValue(false);

    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
    });
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should clear error', async () => {
    const user = userEvent.setup();
    mockAuthService.login.mockImplementation(() => Promise.reject(new Error('Test error')));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Test error');
    });

    await user.click(screen.getByText('Clear Error'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });
  });
});
