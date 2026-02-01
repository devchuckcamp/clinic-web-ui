import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { notesService } from '@/services';
import { useAuth } from './AuthContext';
import type {
  Note,
  NotesFilter,
  CreateNoteInput,
  UpdateNoteInput,
  Attachment,
} from '@/types';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface NotesContextType extends NotesState {
  fetchNotes: (patientId: string, filter?: NotesFilter, append?: boolean) => Promise<void>;
  fetchNote: (patientId: string, noteId: string) => Promise<void>;
  createNote: (patientId: string, input: CreateNoteInput) => Promise<Note>;
  updateNote: (patientId: string, noteId: string, input: UpdateNoteInput) => Promise<Note>;
  deleteNote: (patientId: string, noteId: string) => Promise<void>;
  uploadAttachment: (
    patientId: string,
    noteId: string,
    file: File,
    currentVersion: number,
    existingAttachments: Attachment[]
  ) => Promise<Note>;
  downloadAttachment: (patientId: string, noteId: string, attachmentId: string) => Promise<void>;
  clearCurrentNote: () => void;
  clearError: () => void;
  clearNotes: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

export function NotesProvider({ children }: NotesProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const cursorRef = useRef<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  // Clear notes when user changes or logs out
  // This prevents data from previous user being visible to new user
  useEffect(() => {
    const currentUserId = user?.sub ?? null;

    // If user changed (including logout), clear all notes data
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
      setNotes([]);
      setCurrentNote(null);
      setError(null);
      setHasMore(false);
      cursorRef.current = null;
    }

    previousUserIdRef.current = currentUserId;
  }, [user?.sub, isAuthenticated]);

  const fetchNotes = useCallback(
    async (patientId: string, filter?: NotesFilter, append = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await notesService.listNotes(patientId, {
          ...filter,
          limit: filter?.limit ?? 10,
          cursor: append ? cursorRef.current ?? undefined : undefined,
        });

        setNotes((prev) => (append ? [...prev, ...response.items] : response.items));
        setHasMore(response.hasMore);
        cursorRef.current = response.nextCursor ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch notes';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchNote = useCallback(async (patientId: string, noteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const note = await notesService.getNote(patientId, noteId);
      setCurrentNote(note);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch note';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNote = useCallback(async (patientId: string, input: CreateNoteInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const note = await notesService.createNote(patientId, input);
      setNotes((prev) => [note, ...prev]);
      setCurrentNote(note);
      return note;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNote = useCallback(
    async (patientId: string, noteId: string, input: UpdateNoteInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await notesService.updateNote(patientId, noteId, input);
        setNotes((prev) => prev.map((n) => (n.noteId === noteId ? updated : n)));
        setCurrentNote(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update note';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteNote = useCallback(async (patientId: string, noteId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await notesService.deleteNote(patientId, noteId);
      setNotes((prev) => prev.filter((n) => n.noteId !== noteId));
      if (currentNote?.noteId === noteId) {
        setCurrentNote(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentNote]);

  const uploadAttachment = useCallback(
    async (
      patientId: string,
      noteId: string,
      file: File,
      currentVersion: number,
      existingAttachments: Attachment[]
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Get presigned URL
        const presignResponse = await notesService.getPresignedUrl(patientId, noteId, {
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        });

        // 2. Upload file to S3
        await notesService.uploadAttachment(presignResponse.uploadUrl, file);

        // 3. Update note with attachment metadata
        const newAttachment: Attachment = {
          id: presignResponse.attachmentId,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
          s3Key: presignResponse.s3Key,
          uploadedAt: new Date().toISOString(),
        };

        const updated = await notesService.updateNote(patientId, noteId, {
          version: currentVersion,
          attachments: [...existingAttachments, newAttachment],
        });

        setNotes((prev) => prev.map((n) => (n.noteId === noteId ? updated : n)));
        setCurrentNote(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload attachment';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const downloadAttachment = useCallback(
    async (patientId: string, noteId: string, attachmentId: string) => {
      setError(null);

      try {
        // Get presigned download URL
        const response = await notesService.getDownloadUrl(patientId, noteId, attachmentId);

        // Trigger download by opening the URL
        window.open(response.downloadUrl, '_blank');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to download attachment';
        setError(message);
        throw err;
      }
    },
    []
  );

  const clearCurrentNote = useCallback(() => {
    setCurrentNote(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearNotes = useCallback(() => {
    setNotes([]);
    setCurrentNote(null);
    cursorRef.current = null;
    setHasMore(false);
  }, []);

  const value: NotesContextType = {
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
    uploadAttachment,
    downloadAttachment,
    clearCurrentNote,
    clearError,
    clearNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
