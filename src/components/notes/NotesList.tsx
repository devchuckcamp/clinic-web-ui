import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNotes } from '@/contexts';
import { NoteCard } from './NoteCard';
import { Button, Loading, Alert } from '@/components/common';
import type { NotesFilter } from '@/types';

interface NotesListProps {
  patientId: string;
  filter?: NotesFilter;
}

export function NotesList({ patientId, filter }: NotesListProps) {
  const { notes, isLoading, error, hasMore, fetchNotes, clearError } = useNotes();

  useEffect(() => {
    fetchNotes(patientId, filter);
  }, [patientId, filter, fetchNotes]);

  const handleLoadMore = () => {
    fetchNotes(patientId, filter, true);
  };

  if (error) {
    return (
      <Alert type="error" onClose={clearError} className="snoremd-notes-list-error">
        {error}
      </Alert>
    );
  }

  if (isLoading && notes.length === 0) {
    return (
      <Box className="snoremd-notes-list-loading" sx={{ py: 6 }}>
        <Loading size="lg" text="Loading notes..." />
      </Box>
    );
  }

  if (notes.length === 0) {
    return (
      <Box className="snoremd-notes-list-empty" sx={{ textAlign: 'center', py: 6 }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium" className="snoremd-notes-empty-title">
          No notes found
        </Typography>
        <Typography variant="body2" color="text.secondary" className="snoremd-notes-empty-message">
          Get started by creating a new note for this patient.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} className="snoremd-notes-list">
      {notes.map((note) => (
        <NoteCard key={note.noteId} note={note} patientId={patientId} />
      ))}

      {hasMore && (
        <Box className="snoremd-notes-list-pagination" sx={{ textAlign: 'center', pt: 2 }}>
          <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoading} className="snoremd-notes-load-more-btn">
            Load more
          </Button>
        </Box>
      )}
    </Stack>
  );
}
