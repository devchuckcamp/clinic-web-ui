import { apiClient } from './api';
import { API_CONFIG } from './config';
import type {
  Note,
  NotesListResponse,
  NotesFilter,
  CreateNoteInput,
  UpdateNoteInput,
  PresignRequest,
  PresignResponse,
  DownloadResponse,
} from '@/types';

export const notesService = {
  async listNotes(patientId: string, filter?: NotesFilter): Promise<NotesListResponse> {
    const params = new URLSearchParams();

    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.cursor) params.set('cursor', filter.cursor);
    if (filter?.from) params.set('studyDateFrom', filter.from);
    if (filter?.to) params.set('studyDateTo', filter.to);
    if (filter?.tag) params.set('tag', filter.tag);
    if (filter?.q) params.set('q', filter.q);

    const queryString = params.toString();
    const endpoint = `${API_CONFIG.endpoints.notes(patientId)}${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<NotesListResponse>(endpoint);
  },

  async getNote(patientId: string, noteId: string): Promise<Note> {
    return apiClient.get<Note>(API_CONFIG.endpoints.note(patientId, noteId));
  },

  async createNote(patientId: string, input: CreateNoteInput): Promise<Note> {
    return apiClient.post<Note>(API_CONFIG.endpoints.notes(patientId), input);
  },

  async updateNote(patientId: string, noteId: string, input: UpdateNoteInput): Promise<Note> {
    return apiClient.put<Note>(API_CONFIG.endpoints.note(patientId, noteId), input);
  },

  async deleteNote(patientId: string, noteId: string): Promise<void> {
    await apiClient.delete<void>(API_CONFIG.endpoints.note(patientId, noteId));
  },

  async getPresignedUrl(
    patientId: string,
    noteId: string,
    request: PresignRequest
  ): Promise<PresignResponse> {
    return apiClient.post<PresignResponse>(
      API_CONFIG.endpoints.presign(patientId, noteId),
      request
    );
  },

  async uploadAttachment(uploadUrl: string, file: File): Promise<void> {
    await apiClient.uploadFile(uploadUrl, file, file.type);
  },

  async getDownloadUrl(
    patientId: string,
    noteId: string,
    attachmentId: string
  ): Promise<DownloadResponse> {
    return apiClient.get<DownloadResponse>(
      API_CONFIG.endpoints.download(patientId, noteId, attachmentId)
    );
  },
};
