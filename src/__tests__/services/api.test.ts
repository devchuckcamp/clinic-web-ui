import { apiClient } from '@/services/api';

describe('ApiClient', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
  });

  describe('get', () => {
    it('should make a GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiClient.get<typeof mockData>('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockData);
    });

    it('should include Authorization header when token exists', async () => {
      const token = 'test-token';
      const futureExpiry = String(Date.now() + 3600000); // 1 hour from now
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'snoremd_id_token') return token;
        if (key === 'snoremd_token_expiry') return futureExpiry;
        return null;
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it('should throw error on non-ok response', async () => {
      const errorMessage = 'Not found';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: errorMessage } }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow(errorMessage);
    });

    it('should throw generic error when error message is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('An error occurred');
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      const body = { name: 'Test' };
      const mockData = { id: 1, ...body };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiClient.post<typeof mockData>('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make a POST request without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      await apiClient.post('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  describe('put', () => {
    it('should make a PUT request with body', async () => {
      const body = { name: 'Updated' };
      const mockData = { id: 1, ...body };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const result = await apiClient.put<typeof mockData>('/test', body);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      await apiClient.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload file with correct content type', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const uploadUrl = 'https://s3.amazonaws.com/bucket/key';
      mockFetch.mockResolvedValueOnce({ ok: true });

      await apiClient.uploadFile(uploadUrl, file, 'text/plain');

      expect(mockFetch).toHaveBeenCalledWith(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: file,
      });
    });

    it('should throw error on failed upload', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      mockFetch.mockResolvedValueOnce({ ok: false });

      await expect(
        apiClient.uploadFile('https://test.com', file, 'text/plain')
      ).rejects.toThrow('File upload failed');
    });
  });
});
