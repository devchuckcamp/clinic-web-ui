import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '@/contexts';
import { Card, CardContent } from '@/components/common';

export function DashboardPage() {
  const { user, clinic } = useAuth();

  const quickActions = [
    {
      title: 'Patients',
      description: 'View and manage Patients',
      href: '/patients',
      icon: <PeopleIcon />,
    },
  ];

  return (
    <Box className="snoremd-dashboard-page" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Welcome Section */}
      <Paper variant="outlined" sx={{ p: 3 }} className="snoremd-dashboard-welcome">
        <Typography variant="h5" fontWeight="bold" className="snoremd-dashboard-welcome-title">
          Welcome back, {user?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} className="snoremd-dashboard-welcome-subtitle">
          Clinic: {clinic?.name || user?.clinicId} - Role: {user?.groups.join(', ') || 'User'}
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Box className="snoremd-dashboard-quick-actions-section">
        <Typography variant="h6" sx={{ mb: 2 }} className="snoremd-dashboard-quick-actions-title">
          Quick Actions
        </Typography>
        <Grid container spacing={2} className="snoremd-dashboard-quick-actions-grid">
          {quickActions.map((action) => (
            <Grid item xs={12} md={6} key={action.title} className="snoremd-dashboard-quick-action-item">
              <Link to={action.href} style={{ textDecoration: 'none' }} className="snoremd-dashboard-quick-action-link">
                <Card hoverable className="snoremd-dashboard-quick-action-card">
                  <CardContent className="snoremd-dashboard-quick-action-content">
                    <Box className="snoremd-dashboard-quick-action-row" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        className="snoremd-dashboard-quick-action-icon"
                        sx={{
                          p: 1.5,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box className="snoremd-dashboard-quick-action-info" sx={{ ml: 2 }}>
                        <Typography variant="subtitle1" fontWeight="medium" className="snoremd-dashboard-quick-action-name">
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="snoremd-dashboard-quick-action-description">
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* System Info */}
      <Box className="snoremd-dashboard-system-info-section">
        <Typography variant="h6" sx={{ mb: 2 }} className="snoremd-dashboard-system-info-title">
          System Information
        </Typography>
        <Card className="snoremd-dashboard-system-info-card">
          <CardContent className="snoremd-dashboard-system-info-content">
            <Grid container spacing={2} className="snoremd-dashboard-system-info-grid">
              <Grid item xs={12} sm={6} className="snoremd-dashboard-system-info-item">
                <Typography variant="body2" color="text.secondary" className="snoremd-dashboard-api-endpoint-label">
                  API Endpoint
                </Typography>
                <Typography variant="body1" className="snoremd-dashboard-api-endpoint-value">
                  {import.meta.env.VITE_API_URL || '/api (proxied)'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} className="snoremd-dashboard-system-info-item">
                <Typography variant="body2" color="text.secondary" className="snoremd-dashboard-environment-label">
                  Environment
                </Typography>
                <Typography variant="body1" className="snoremd-dashboard-environment-value">
                  {import.meta.env.MODE}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
