import '@testing-library/jest-dom';

// Mock the config module to avoid import.meta.env issues
jest.mock('../services/config', () => ({
  API_CONFIG: {
    baseUrl: 'https://gksonzdd9g.execute-api.us-east-1.amazonaws.com/dev',
    endpoints: {
      login: '/auth/login',
      clinic: '/clinic',
      patients: '/patients',
      notes: (patientId: string) => `/patients/${patientId}/notes`,
      note: (patientId: string, noteId: string) => `/patients/${patientId}/notes/${noteId}`,
      presign: (patientId: string, noteId: string) =>
        `/patients/${patientId}/notes/${noteId}/attachments/presign`,
      download: (patientId: string, noteId: string, attachmentId: string) =>
        `/patients/${patientId}/notes/${noteId}/attachments/${attachmentId}/download`,
    },
  },
  STORAGE_KEYS: {
    idToken: 'snoremd_id_token',
    accessToken: 'snoremd_access_token',
    refreshToken: 'snoremd_refresh_token',
    tokenExpiry: 'snoremd_token_expiry',
    user: 'snoremd_user',
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.open
Object.defineProperty(window, 'open', { value: jest.fn() });

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockReset();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
});
