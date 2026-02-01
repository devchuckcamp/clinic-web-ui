import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiButton from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNotes } from '@/contexts';
import { NoteDetail, NoteForm } from '@/components/notes';
import { Card, CardContent, CardHeader, Loading, Alert } from '@/components/common';
import type { CreateNoteInput } from '@/types';

export function NoteDetailPage() {
  const { patientId, noteId } = useParams<{ patientId: string; noteId: string }>();
  const navigate = useNavigate();
  const {
    currentNote,
    fetchNote,
    updateNote,
    deleteNote,
    uploadAttachment,
    downloadAttachment,
    isLoading,
    error,
    clearError,
  } = useNotes();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (patientId && noteId) {
      fetchNote(patientId, noteId);
    }
  }, [patientId, noteId, fetchNote]);

  if (!patientId || !noteId) {
    navigate('/patients');
    return null;
  }

  const handleUpdate = async (data: CreateNoteInput) => {
    if (!currentNote) return;

    try {
      await updateNote(patientId, noteId, {
        ...data,
        version: currentNote.version,
      });
      setIsEditing(false);
    } catch {
      // Error handled by context
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(patientId, noteId);
      navigate(`/patients/${patientId}/notes`);
    } catch {
      // Error handled by context
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!currentNote) return;

    await uploadAttachment(
      patientId,
      noteId,
      file,
      currentNote.version,
      currentNote.attachments
    );
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    await downloadAttachment(patientId, noteId, attachmentId);
  };

  if (isLoading && !currentNote) {
    return (
      <Box className="snoremd-note-detail-page-loading" sx={{ py: 6 }}>
        <Loading size="lg" text="Loading note..." />
      </Box>
    );
  }

  if (error && !currentNote) {
    return (
      <Alert type="error" onClose={clearError} className="snoremd-note-detail-page-error">
        {error}
      </Alert>
    );
  }

  if (!currentNote) {
    return (
      <Alert type="error" className="snoremd-note-detail-page-not-found">
        Note not found
      </Alert>
    );
  }

  return (
    <Stack spacing={3} className="snoremd-note-detail-page">
      {/* Header */}
      <Box className="snoremd-note-detail-page-header">
        <MuiButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/patients/${patientId}/notes`)}
          size="small"
          color="inherit"
          sx={{ mb: 1, color: 'text.secondary' }}
          className="snoremd-note-detail-page-back-btn"
        >
          Back to Notes
        </MuiButton>
      </Box>

      {/* Edit Form or Detail View */}
      {isEditing ? (
        <Card className="snoremd-note-detail-page-edit-card">
          <CardHeader className="snoremd-note-detail-page-edit-header">
            <Typography variant="h6" className="snoremd-note-detail-page-edit-title">Edit Note</Typography>
          </CardHeader>
          <CardContent className="snoremd-note-detail-page-edit-content">
            <NoteForm
              initialData={currentNote}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditing(false);
                clearError();
              }}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
        </Card>
      ) : (
        <NoteDetail
          note={currentNote}
          patientId={patientId}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onUploadAttachment={handleUploadAttachment}
          onDownloadAttachment={handleDownloadAttachment}
          isLoading={isLoading}
          error={error}
        />
      )}
    </Stack>
  );
}
