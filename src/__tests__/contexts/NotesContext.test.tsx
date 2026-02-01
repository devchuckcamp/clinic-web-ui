import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesProvider, useNotes } from '@/contexts/NotesContext';
import { notesService } from '@/services';

// Mock the AuthContext that NotesContext depends on
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { sub: 'test-user-123', username: 'testuser', clinicId: 'clinic-a', email: 'test@test.com', groups: [] },
    isAuthenticated: true,
  }),
}));

jest.mock('@/services', () => ({
  notesService: {
    listNotes: jest.fn(),
    getNote: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    getPresignedUrl: jest.fn(),
    uploadAttachment: jest.fn(),
    getDownloadUrl: jest.fn(),
  },
}));

const mockNotesService = notesService as jest.Mocked<typeof notesService>;

// Test component to access context
function TestComponent({ patientId = 'pat-123' }: { patientId?: string }) {
  const {
    notes,
    currentNote,
    isLoading,
    error,
    hasMore,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    clearError,
    clearNotes,
  } = useNotes();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="error">{error || 'none'}</div>
      <div data-testid="notes-count">{notes.length}</div>
      <div data-testid="has-more">{hasMore ? 'yes' : 'no'}</div>
      <div data-testid="current-note">{currentNote?.title || 'none'}</div>
      <button onClick={() => fetchNotes(patientId)}>Fetch Notes</button>
      <button onClick={() => fetchNotes(patientId, {}, true)}>Load More</button>
      <button onClick={() => fetchNote(patientId, 'note-1')}>Fetch Note</button>
      <button
        onClick={() =>
          createNote(patientId, { studyDate: '2024-01-01', title: 'Test', content: 'Content' })
        }
      >
        Create Note
      </button>
      <button onClick={() => updateNote(patientId, 'note-1', { title: 'Updated', version: 1 })}>
        Update Note
      </button>
      <button onClick={() => deleteNote(patientId, 'note-1')}>Delete Note</button>
      <button onClick={clearError}>Clear Error</button>
      <button onClick={clearNotes}>Clear Notes</button>
    </div>
  );
}

describe('NotesContext', () => {
  const mockNotes = [
    { noteId: 'note-1', title: 'Note 1', content: 'Content 1', studyDate: '2024-01-01', patientId: 'pat-123', attachments: [], createdAt: '', updatedAt: '', createdBy: 'user-1', createdByName: 'Dr. Smith', version: 1 },
    { noteId: 'note-2', title: 'Note 2', content: 'Content 2', studyDate: '2024-01-02', patientId: 'pat-123', attachments: [], createdAt: '', updatedAt: '', createdBy: 'user-1', createdByName: 'Dr. Smith', version: 1 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotesService.listNotes.mockResolvedValue({ items: [], hasMore: false });
  });

  it('should throw error when useNotes is used outside NotesProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNotes must be used within a NotesProvider');

    consoleSpy.mockRestore();
  });

  it('should fetch notes successfully', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockResolvedValue({
      items: mockNotes,
      hasMore: true,
      nextCursor: 'cursor-123',
    });

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Fetch Notes'));

    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('has-more')).toHaveTextContent('yes');
    });
  });

  it('should load more notes (pagination)', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes
      .mockResolvedValueOnce({
        items: [mockNotes[0]],
        hasMore: true,
        nextCursor: 'cursor-1',
      })
      .mockResolvedValueOnce({
        items: [mockNotes[1]],
        hasMore: false,
      });

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    // First fetch
    await user.click(screen.getByText('Fetch Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('1');
    });

    // Load more
    await user.click(screen.getByText('Load More'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
      expect(screen.getByTestId('has-more')).toHaveTextContent('no');
    });
  });

  it('should fetch single note', async () => {
    const user = userEvent.setup();
    mockNotesService.getNote.mockResolvedValue(mockNotes[0]);

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Fetch Note'));

    await waitFor(() => {
      expect(screen.getByTestId('current-note')).toHaveTextContent('Note 1');
    });
  });

  it('should create note', async () => {
    const user = userEvent.setup();
    const newNote = { ...mockNotes[0], noteId: 'new-note' };
    mockNotesService.createNote.mockResolvedValue(newNote);

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Create Note'));

    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('1');
      expect(mockNotesService.createNote).toHaveBeenCalled();
    });
  });

  it('should update note', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockResolvedValue({ items: mockNotes, hasMore: false });
    const updatedNote = { ...mockNotes[0], title: 'Updated Title' };
    mockNotesService.updateNote.mockResolvedValue(updatedNote);

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    // First fetch notes
    await user.click(screen.getByText('Fetch Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
    });

    // Update note
    await user.click(screen.getByText('Update Note'));

    await waitFor(() => {
      expect(mockNotesService.updateNote).toHaveBeenCalled();
    });
  });

  it('should delete note', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockResolvedValue({ items: mockNotes, hasMore: false });
    mockNotesService.deleteNote.mockResolvedValue(undefined);

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    // First fetch notes
    await user.click(screen.getByText('Fetch Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
    });

    // Delete note
    await user.click(screen.getByText('Delete Note'));

    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('1');
    });
  });

  it('should handle fetch error', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockRejectedValue(new Error('Network error'));

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Fetch Notes'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('should clear error', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockRejectedValue(new Error('Test error'));

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Fetch Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Test error');
    });

    await user.click(screen.getByText('Clear Error'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });
  });

  it('should clear notes', async () => {
    const user = userEvent.setup();
    mockNotesService.listNotes.mockResolvedValue({ items: mockNotes, hasMore: true });

    render(
      <NotesProvider>
        <TestComponent />
      </NotesProvider>
    );

    await user.click(screen.getByText('Fetch Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('2');
    });

    await user.click(screen.getByText('Clear Notes'));
    await waitFor(() => {
      expect(screen.getByTestId('notes-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-more')).toHaveTextContent('no');
    });
  });
});
