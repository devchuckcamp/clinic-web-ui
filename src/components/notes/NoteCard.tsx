import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Card, CardContent } from '@/components/common';
import { formatDate, formatDateTime, truncate } from '@/utils';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  patientId: string;
}

export function NoteCard({ note, patientId }: NoteCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patients/${patientId}/notes/${note.noteId}`);
  };

  return (
    <Card hoverable onClick={handleClick} className="snoremd-note-card">
      <CardContent className="snoremd-note-card-content">
        <Box className="snoremd-note-card-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box className="snoremd-note-card-info" sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="medium" noWrap className="snoremd-note-card-title">
              {note.title}
            </Typography>
            <Box className="snoremd-note-card-meta" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" className="snoremd-note-card-study-date">
                Study: {formatDate(note.studyDate)}
              </Typography>
              {note.noteType && (
                <Chip label={note.noteType} size="small" variant="outlined" className="snoremd-note-card-type-chip" />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} className="snoremd-note-card-author">
              By: {note.createdByName} | {formatDateTime(note.createdAt)}
            </Typography>
          </Box>
          {note.attachments.length > 0 && (
            <Chip
              icon={<AttachFileIcon />}
              label={note.attachments.length}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 2 }}
              className="snoremd-note-card-attachment-count"
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} className="snoremd-note-card-content-preview">
          {truncate(note.content, 150)}
        </Typography>
        {note.tags && note.tags.length > 0 && (
          <Box className="snoremd-note-card-tags" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" color="primary" className="snoremd-note-card-tag" />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
