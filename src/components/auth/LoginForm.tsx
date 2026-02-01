import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/contexts';
import { Button, Alert } from '@/components/common';

export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ username, password });
    } catch {
      // Error is handled by context
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="snoremd-login-form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert type="error" onClose={clearError} className="snoremd-login-error-alert">
          {error}
        </Alert>
      )}

      <TextField
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        required
        autoComplete="username"
        autoFocus
        fullWidth
        className="snoremd-login-username-field"
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        autoComplete="current-password"
        fullWidth
        className="snoremd-login-password-field"
      />

      <Button type="submit" fullWidth isLoading={isLoading} disabled={!username || !password} className="snoremd-login-submit-btn">
        Sign in
      </Button>

      <Typography variant="body2" color="text.secondary" align="center" className="snoremd-login-hint-text">
        Test credentials: dr-smith / SecurePass123!
      </Typography>
    </Box>
  );
}
