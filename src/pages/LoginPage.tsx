import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '@/contexts';
import { LoginForm } from '@/components/auth';

// Safe routes that can be redirected to after login
// Patient-specific routes are NOT safe because they may belong to a different clinic
const SAFE_REDIRECT_ROUTES = ['/', '/patients', '/notes'];

function isSafeRedirectRoute(pathname: string): boolean {
  return SAFE_REDIRECT_ROUTES.includes(pathname);
}

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the intended redirect path, but only use it if it's a safe route
  const requestedPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const from = requestedPath && isSafeRedirectRoute(requestedPath) ? requestedPath : '/';

  if (isAuthenticated) {
    // Clear the location state to prevent stale redirects on subsequent logins
    return <Navigate to={from} replace state={{}} />;
  }

  return (
    <Box
      className="snoremd-login-page"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 6,
      }}
    >
      <Container maxWidth="sm" className="snoremd-login-container">
        <Box className="snoremd-login-branding" sx={{ textAlign: 'center', mb: 4 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 48, mb: 2 }} className="snoremd-login-logo-icon" />
          <Typography variant="h4" component="h1" fontWeight="bold" className="snoremd-login-app-name">
            SnoreMD
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }} className="snoremd-login-tagline">
            Medical Notes Management System
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 4 }} className="snoremd-login-card">
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
}
