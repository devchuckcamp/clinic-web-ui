// Mock API Configuration for tests
export const API_CONFIG = {
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
};

// Token storage keys
export const STORAGE_KEYS = {
  idToken: 'snoremd_id_token',
  accessToken: 'snoremd_access_token',
  refreshToken: 'snoremd_refresh_token',
  tokenExpiry: 'snoremd_token_expiry',
  user: 'snoremd_user',
};
