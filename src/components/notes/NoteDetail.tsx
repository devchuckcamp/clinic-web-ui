import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Card, CardHeader, CardContent, CardFooter, Button, Alert } from '@/components/common';
import { formatDateTime, formatFileSize } from '@/utils';
import type { Note, Attachment } from '@/types';

interface NoteDetailProps {
  note: Note;
  patientId: string;
  onEdit: () => void;
  onDelete: () => void;
  onUploadAttachment: (file: File) => Promise<void>;
  onDownloadAttachment: (attachmentId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function NoteDetail({
  note,
  onEdit,
  onDelete,
  onUploadAttachment,
  onDownloadAttachment,
  isLoading,
  error,
}: NoteDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUploadAttachment(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleDownload = async (attachmentId: string) => {
    setDownloadingId(attachmentId);
    try {
      await onDownloadAttachment(attachmentId);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="snoremd-note-detail">
      <CardHeader className="snoremd-note-detail-header">
        <Box className="snoremd-note-detail-header-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box className="snoremd-note-detail-info">
            <Typography variant="h6" fontWeight="semibold" className="snoremd-note-detail-title">
              {note.title}
            </Typography>
            <Box className="snoremd-note-detail-meta" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" className="snoremd-note-detail-created-at">
                {formatDateTime(note.createdAt)}
              </Typography>
              {note.noteType && (
                <Chip label={note.noteType} size="small" variant="outlined" className="snoremd-note-detail-type-chip" />
              )}
            </Box>
          </Box>
          <Box className="snoremd-note-detail-actions" sx={{ display: 'flex', gap: 1 }}>
            <Button variant="secondary" size="sm" onClick={onEdit} className="snoremd-note-detail-edit-btn">
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} className="snoremd-note-detail-delete-btn">
              Delete
            </Button>
          </Box>
        </Box>
      </CardHeader>

      <CardContent className="snoremd-note-detail-content">
        {error && (
          <Alert type="error" className="snoremd-note-detail-error mb-4">
            {error}
          </Alert>
        )}

        {showDeleteConfirm && (
          <Alert type="warning" className="snoremd-note-detail-delete-confirm mb-4">
            <Box className="snoremd-note-detail-delete-confirm-row" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" className="snoremd-note-detail-delete-message">
                Are you sure you want to delete this note?
              </Typography>
              <Box className="snoremd-note-detail-delete-actions" sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="snoremd-note-detail-delete-cancel-btn">
                  Cancel
                </Button>
                <Button size="sm" variant="danger" onClick={handleDelete} isLoading={isLoading} className="snoremd-note-detail-delete-confirm-btn">
                  Confirm
                </Button>
              </Box>
            </Box>
          </Alert>
        )}

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }} className="snoremd-note-detail-content-text">
          {note.content}
        </Typography>

        {note.tags && note.tags.length > 0 && (
          <Box className="snoremd-note-detail-tags" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" color="primary" className="snoremd-note-detail-tag" />
            ))}
          </Box>
        )}

        {/* Attachments Section */}
        <Divider sx={{ my: 3 }} />
        <Box className="snoremd-note-detail-attachments-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="medium" className="snoremd-note-detail-attachments-title">
            Attachments ({note.attachments.length})
          </Typography>
          <Box className="snoremd-note-detail-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="snoremd-note-detail-file-input"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              className="snoremd-note-detail-upload-btn"
            >
              Upload File
            </Button>
          </Box>
        </Box>

        {note.attachments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="snoremd-note-detail-no-attachments">
            No attachments yet.
          </Typography>
        ) : (
          <List disablePadding className="snoremd-note-detail-attachments-list">
            {note.attachments.map((attachment: Attachment) => (
              <ListItem
                key={attachment.id}
                divider
                className="snoremd-note-detail-attachment-item"
                secondaryAction={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(attachment.id)}
                    isLoading={downloadingId === attachment.id}
                    className="snoremd-note-detail-download-btn"
                  >
                    Download
                  </Button>
                }
              >
                <ListItemIcon>
                  <AttachFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={attachment.fileName}
                  secondary={`${formatFileSize(attachment.sizeBytes)} - ${attachment.contentType}`}
                  className="snoremd-note-detail-attachment-info"
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <CardFooter className="snoremd-note-detail-footer">
        <Box className="snoremd-note-detail-footer-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" className="snoremd-note-detail-version">
            Version {note.version}
          </Typography>
          <Typography variant="caption" color="text.secondary" className="snoremd-note-detail-updated-at">
            Last updated: {formatDateTime(note.updatedAt)}
          </Typography>
        </Box>
      </CardFooter>
    </Card>
  );
}
