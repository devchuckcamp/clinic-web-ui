import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import { useMediaQuery, Theme } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const DRAWER_WIDTH = 256;
const COLLAPSED_WIDTH = 64;

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const currentWidth = isMobile ? 0 : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box className="snoremd-layout snoremd-layout-root" sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        collapsed={collapsed}
        onMenuClick={handleMobileToggle}
      />
      <Sidebar
        width={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_WIDTH}
        open={mobileOpen}
        collapsed={collapsed}
        onClose={handleMobileToggle}
        onToggleCollapse={handleCollapseToggle}
      />
      <Box
        component="main"
        className="snoremd-layout-main snoremd-main-content"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: 8,
          width: { md: `calc(100% - ${currentWidth}px)` },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
