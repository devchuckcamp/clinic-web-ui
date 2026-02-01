import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useNotes } from '@/contexts';
import { NotesList, NoteForm, NotesFilterPanel } from '@/components/notes';
import { Button, Card, CardContent, CardHeader } from '@/components/common';
import type { CreateNoteInput, NotesFilter } from '@/types';

export function PatientNotesPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { createNote, uploadAttachment, isLoading, error, clearError } = useNotes();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<NotesFilter>({});

  const handleFilterChange = useCallback((newFilter: NotesFilter) => {
    setFilter(newFilter);
  }, []);

  if (!patientId) {
    navigate('/patients');
    return null;
  }

  const handleCreateNote = async (data: CreateNoteInput, file?: File) => {
    try {
      const note = await createNote(patientId, data);

      // If a file was selected, upload it as an attachment
      if (file) {
        await uploadAttachment(patientId, note.noteId, file, note.version, note.attachments || []);
      }

      setShowCreateForm(false);
      navigate(`/patients/${patientId}/notes/${note.noteId}`);
    } catch {
      // Error handled by context
    }
  };

  return (
    <Stack spacing={3} className="snoremd-patient-notes-page">
      {/* Header */}
      <Box className="snoremd-patient-notes-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box className="snoremd-patient-notes-header-info">
          <MuiButton
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
            size="small"
            color="inherit"
            sx={{ mb: 1, color: 'text.secondary' }}
            className="snoremd-patient-notes-back-btn"
          >
            Back to Patients
          </MuiButton>
          <Typography variant="h5" fontWeight="bold" className="snoremd-patient-notes-title">
            Patient Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" className="snoremd-patient-notes-patient-id">
            Patient ID: {patientId}
          </Typography>
        </Box>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} startIcon={<AddIcon />} className="snoremd-patient-notes-new-note-btn">
            New Note
          </Button>
        )}
      </Box>

      {/* Create Note Form */}
      {showCreateForm && (
        <Card className="snoremd-patient-notes-create-card">
          <CardHeader className="snoremd-patient-notes-create-header">
            <Typography variant="h6" className="snoremd-patient-notes-create-title">Create New Note</Typography>
          </CardHeader>
          <CardContent className="snoremd-patient-notes-create-content">
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => {
                setShowCreateForm(false);
                clearError();
              }}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {!showCreateForm && (
        <NotesFilterPanel onFilterChange={handleFilterChange} isLoading={isLoading} />
      )}

      {/* Notes List */}
      <NotesList patientId={patientId} filter={filter} />
    </Stack>
  );
}
