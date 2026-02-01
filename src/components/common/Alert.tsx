import { type ReactNode } from 'react';
import MuiAlert, { type AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const severityMap: Record<AlertProps['type'], AlertColor> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function Alert({ type, title, children, onClose, className }: AlertProps) {
  return (
    <MuiAlert
      severity={severityMap[type]}
      className={`snoremd-alert snoremd-alert-${type} ${onClose ? 'snoremd-alert-dismissible' : ''} ${className || ''}`}
      action={
        onClose ? (
          <IconButton
            aria-label="Dismiss"
            color="inherit"
            size="small"
            onClick={onClose}
            className="snoremd-alert-close-btn"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        ) : undefined
      }
    >
      {title && <AlertTitle className="snoremd-alert-title">{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
