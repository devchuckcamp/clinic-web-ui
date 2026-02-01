import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <Box
      className={`snoremd-loading snoremd-loading-${size} ${className || ''}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={sizeMap[size]} className="snoremd-loading-spinner" />
      {text && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} className="snoremd-loading-text">
          {text}
        </Typography>
      )}
    </Box>
  );
}

export function LoadingPage() {
  return (
    <Box
      className="snoremd-loading-page"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loading size="lg" text="Loading..." />
    </Box>
  );
}

export function LoadingOverlay() {
  return (
    <Backdrop
      open
      className="snoremd-loading-overlay"
      sx={{
        position: 'absolute',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <Loading size="lg" />
    </Backdrop>
  );
}
