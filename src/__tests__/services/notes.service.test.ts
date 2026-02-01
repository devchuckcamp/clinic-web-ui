import { notesService } from '@/services/notes.service';
import { apiClient } from '@/services/api';

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    uploadFile: jest.fn(),
  },
}));

describe('notesService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const patientId = 'pat-123';
  const noteId = 'note-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listNotes', () => {
    it('should list notes without filters', async () => {
      const mockResponse = { items: [], hasMore: false };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await notesService.listNotes(patientId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/patients/${patientId}/notes`);
      expect(result).toEqual(mockResponse);
    });

    it('should list notes with all filters', async () => {
      const mockResponse = { items: [], hasMore: false, nextCursor: 'cursor' };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const filter = {
        limit: 20,
        cursor: 'prev-cursor',
        from: '2024-01-01',
        to: '2024-12-31',
        tag: 'important',
        q: 'search term',
      };

      await notesService.listNotes(patientId, filter);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/patients/${patientId}/notes?`)
      );
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('limit=20'));
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('cursor=prev-cursor'));
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('studyDateFrom=2024-01-01'));
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('studyDateTo=2024-12-31'));
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('tag=important'));
      expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('q=search'));
    });
  });

  describe('getNote', () => {
    it('should get a single note', async () => {
      const mockNote = { noteId, title: 'Test Note' };
      mockApiClient.get.mockResolvedValueOnce(mockNote);

      const result = await notesService.getNote(patientId, noteId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/patients/${patientId}/notes/${noteId}`);
      expect(result).toEqual(mockNote);
    });
  });

  describe('createNote', () => {
    it('should create a note', async () => {
      const input = {
        studyDate: '2024-01-15',
        title: 'New Note',
        content: 'Note content',
      };
      const mockNote = { noteId: 'new-id', ...input };
      mockApiClient.post.mockResolvedValueOnce(mockNote);

      const result = await notesService.createNote(patientId, input);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/patients/${patientId}/notes`, input);
      expect(result).toEqual(mockNote);
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      const input = { title: 'Updated Title', version: 1 };
      const mockNote = { noteId, ...input };
      mockApiClient.put.mockResolvedValueOnce(mockNote);

      const result = await notesService.updateNote(patientId, noteId, input);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/patients/${patientId}/notes/${noteId}`,
        input
      );
      expect(result).toEqual(mockNote);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      await notesService.deleteNote(patientId, noteId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/patients/${patientId}/notes/${noteId}`);
    });
  });

  describe('getPresignedUrl', () => {
    it('should get presigned URL for upload', async () => {
      const request = {
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        sizeBytes: 1024,
      };
      const mockResponse = {
        uploadUrl: 'https://s3.amazonaws.com/...',
        s3Key: 'key',
        attachmentId: 'att-123',
        expiresIn: 3600,
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await notesService.getPresignedUrl(patientId, noteId, request);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/patients/${patientId}/notes/${noteId}/attachments/presign`,
        request
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadAttachment', () => {
    it('should upload file to presigned URL', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/key';
      mockApiClient.uploadFile.mockResolvedValueOnce(undefined);

      await notesService.uploadAttachment(uploadUrl, file);

      expect(mockApiClient.uploadFile).toHaveBeenCalledWith(uploadUrl, file, 'application/pdf');
    });
  });

  describe('getDownloadUrl', () => {
    it('should get download URL for attachment', async () => {
      const attachmentId = 'att-123';
      const mockResponse = {
        downloadUrl: 'https://s3.amazonaws.com/...',
        fileName: 'test.pdf',
        contentType: 'application/pdf',
        expiresIn: 3600,
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await notesService.getDownloadUrl(patientId, noteId, attachmentId);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/patients/${patientId}/notes/${noteId}/attachments/${attachmentId}/download`
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
