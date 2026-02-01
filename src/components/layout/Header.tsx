import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery, Theme } from '@mui/material';
import { useAuth, useTheme } from '@/contexts';
import { Button } from '@/components/common';

interface HeaderProps {
  drawerWidth: number;
  collapsedWidth: number;
  collapsed: boolean;
  onMenuClick: () => void;
}

export function Header({ drawerWidth, collapsedWidth, collapsed, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, clinic, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    // Navigate to login with replace to clear history state
    // The empty state object ensures no redirect info is preserved
    navigate('/login', { replace: true, state: {} });
  };

  const currentDrawerWidth = isMobile ? 0 : collapsed ? collapsedWidth : drawerWidth;

  return (
    <AppBar
      position="fixed"
      className="snoremd-header snoremd-app-bar"
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
      elevation={0}
    >
      <Toolbar className="snoremd-header-toolbar">
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="Open menu"
            edge="start"
            onClick={onMenuClick}
            className="snoremd-menu-btn"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box className="snoremd-header-brand" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <DescriptionIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            SnoreMD
          </Typography>
        </Box>

        {user && (
          <Box className="snoremd-header-user-section" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme" className="snoremd-theme-toggle-btn">
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Box
              className="snoremd-header-user-info"
              sx={{
                textAlign: 'right',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Typography variant="body2" fontWeight="medium" className="snoremd-header-username">
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" className="snoremd-header-clinic-name">
                {clinic?.name || user.clinicId}
              </Typography>
            </Box>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              className="snoremd-logout-btn"
              sx={{
                minWidth: { xs: 'auto', sm: 'auto' },
                px: { xs: 1, sm: 2 },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Sign out
              </Box>
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
