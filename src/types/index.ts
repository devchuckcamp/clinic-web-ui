// User and Auth Types
export interface User {
  sub: string;
  username: string;
  email: string;
  clinicId: string;
  groups: string[];
}

export interface Clinic {
  clinicId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Note Types
export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  s3Key: string;
  uploadedAt: string;
}

export interface Note {
  noteId: string;
  patientId: string;
  studyDate: string;
  title: string;
  content: string;
  noteType?: string;
  tags?: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName: string;
  version: number;
}

export interface CreateNoteInput {
  studyDate: string;
  title: string;
  content: string;
  noteType?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  noteType?: string;
  tags?: string[];
  attachments?: Attachment[];
  version: number;
}

export interface NotesListResponse {
  items: Note[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface NotesFilter {
  limit?: number;
  cursor?: string;
  from?: string;
  to?: string;
  tag?: string;
  q?: string;
}

// Presign Types
export interface PresignRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface PresignResponse {
  uploadUrl: string;
  s3Key: string;
  attachmentId: string;
  expiresIn: number;
}

export interface DownloadResponse {
  downloadUrl: string;
  fileName: string;
  contentType: string;
  expiresIn: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

// Patient Types
export interface Patient {
  patientId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'archived';
}
