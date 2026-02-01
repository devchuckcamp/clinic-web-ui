import { forwardRef } from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

interface InputProps extends Omit<TextFieldProps, 'error'> {
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, helperText, ...props }, ref) => {
    return (
      <TextField
        inputRef={ref}
        error={!!error}
        helperText={error || helperText}
        fullWidth
        size="small"
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
