import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import { clinicService } from '@/services/clinic.service';
import type { User, LoginCredentials, Clinic } from '@/types';

interface AuthContextType {
  user: User | null;
  clinic: Clinic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clinic data when user is authenticated
  const fetchClinic = useCallback(async () => {
    try {
      const clinicData = await clinicService.getClinic();
      setClinic(clinicData);
    } catch (err) {
      console.error('Failed to fetch clinic:', err);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        setUser(storedUser);
        if (storedUser) {
          await fetchClinic();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchClinic]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const { user } = await authService.login(credentials);
      setUser(user);
      // Fetch clinic data after successful login
      await fetchClinic();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchClinic]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setClinic(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    clinic,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
