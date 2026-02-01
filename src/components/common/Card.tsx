import { type ReactNode } from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = false }: CardProps) {
  return (
    <MuiCard
      className={`snoremd-card ${hoverable ? 'snoremd-card-hoverable' : ''} ${className || ''}`}
      onClick={onClick}
      sx={{
        cursor: hoverable ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': hoverable
          ? {
              boxShadow: 2,
              borderColor: 'action.hover',
            }
          : {},
      }}
    >
      {children}
    </MuiCard>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <Box
      className={`snoremd-card-header ${className || ''}`}
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <MuiCardContent className={`snoremd-card-content ${className || ''}`} sx={{ '&:last-child': { pb: 2 } }}>
      {children}
    </MuiCardContent>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <Box
      className={`snoremd-card-footer ${className || ''}`}
      sx={{
        px: 2,
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      {children}
    </Box>
  );
}
