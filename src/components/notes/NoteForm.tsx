import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Button, Alert } from '@/components/common';
import { getTodayISO, formatFileSize } from '@/utils';
import type { CreateNoteInput, Note } from '@/types';

interface NoteFormProps {
  initialData?: Note;
  onSubmit: (data: CreateNoteInput, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const NOTE_TYPES = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'progress', label: 'Progress' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'other', label: 'Other' },
];

export function NoteForm({ initialData, onSubmit, onCancel, isLoading, error }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [studyDate, setStudyDate] = useState(
    initialData?.studyDate?.split('T')[0] || getTodayISO()
  );
  const [noteType, setNoteType] = useState(initialData?.noteType || 'clinical');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('File type not supported. Please upload PDF, images, Word docs, or text files.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds maximum allowed (${formatFileSize(MAX_FILE_SIZE)})`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data: CreateNoteInput = {
      title,
      content,
      studyDate,
      noteType,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    await onSubmit(data, selectedFile || undefined);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="snoremd-note-form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && <Alert type="error" className="snoremd-note-form-error">{error}</Alert>}

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title"
        required
        autoFocus
        fullWidth
        className="snoremd-note-form-title-field"
      />

      <TextField
        label="Study Date"
        type="date"
        value={studyDate}
        onChange={(e) => setStudyDate(e.target.value)}
        required
        fullWidth
        className="snoremd-note-form-study-date-field"
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        select
        label="Note Type"
        value={noteType}
        onChange={(e) => setNoteType(e.target.value)}
        fullWidth
        className="snoremd-note-form-type-field"
      >
        {NOTE_TYPES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter note content..."
        required
        fullWidth
        multiline
        rows={6}
        className="snoremd-note-form-content-field"
      />

      <TextField
        label="Tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Enter tags separated by commas"
        helperText="e.g., follow-up, urgent, review"
        fullWidth
        className="snoremd-note-form-tags-field"
      />

      {/* Attachment Upload - only for new notes */}
      {!initialData && (
        <Box className="snoremd-note-form-attachment-section">
          <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }} className="snoremd-note-form-attachment-label">
            Attachment (Optional)
          </Typography>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="snoremd-note-form-choose-file-btn"
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.txt"
            style={{ display: 'none' }}
            className="snoremd-note-form-file-input"
          />
          {fileError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }} className="snoremd-note-form-file-error">
              {fileError}
            </Typography>
          )}
          {selectedFile && !fileError && (
            <Box className="snoremd-note-form-selected-file" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <CheckCircleIcon color="success" fontSize="small" />
              <Typography variant="body2" className="snoremd-note-form-file-name">
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="snoremd-note-form-file-size">
                ({formatFileSize(selectedFile.size)})
              </Typography>
              <IconButton size="small" onClick={removeFile} color="error" className="snoremd-note-form-remove-file-btn">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }} className="snoremd-note-form-file-hint">
            Supported: PDF, Images (JPG, PNG, GIF), Word docs, Text files. Max 100MB.
          </Typography>
        </Box>
      )}

      <Box className="snoremd-note-form-actions" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button type="button" variant="secondary" onClick={onCancel} className="snoremd-note-form-cancel-btn">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="snoremd-note-form-submit-btn">
          {initialData ? 'Update Note' : 'Create Note'}
        </Button>
      </Box>
    </Box>
  );
}
