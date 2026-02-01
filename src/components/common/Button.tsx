import { type ReactNode } from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantMap = {
  primary: { muiVariant: 'contained', color: 'primary' },
  secondary: { muiVariant: 'outlined', color: 'inherit' },
  danger: { muiVariant: 'contained', color: 'error' },
  ghost: { muiVariant: 'text', color: 'inherit' },
} as const;

const sizeMap = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const { muiVariant, color } = variantMap[variant];
  const muiSize = sizeMap[size];

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      size={muiSize}
      disabled={disabled || isLoading}
      className={`snoremd-btn snoremd-btn-${variant} snoremd-btn-${size} ${isLoading ? 'snoremd-btn-loading' : ''} ${className || ''}`}
      {...props}
    >
      {isLoading && (
        <CircularProgress
          size={16}
          color="inherit"
          sx={{ mr: 1 }}
          className="snoremd-btn-spinner"
        />
      )}
      {children}
    </MuiButton>
  );
}
