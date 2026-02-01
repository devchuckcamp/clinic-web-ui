import { NavLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useTheme, useMediaQuery, Theme } from '@mui/material';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: <DashboardIcon />,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: <PeopleIcon />,
  },
];

interface SidebarProps {
  width: number;
  collapsedWidth: number;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ width, collapsedWidth, open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const currentWidth = collapsed && !isMobile ? collapsedWidth : width;

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: collapsed && !isMobile ? 'center' : 'flex-end' }}>
        {!isMobile && (
          <IconButton
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="snoremd-sidebar-collapse-btn"
            sx={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List className="snoremd-sidebar-nav-list" sx={{ px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }} className="snoremd-sidebar-nav-item">
            <ListItemButton
              component={NavLink}
              to={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`snoremd-sidebar-nav-link snoremd-nav-${item.name.toLowerCase()}`}
              sx={{
                borderRadius: 1,
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                px: collapsed && !isMobile ? 2 : 2.5,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:not(.active):hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(!collapsed || isMobile) && <ListItemText primary={item.name} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  // Mobile: temporary drawer (overlay)
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        className="snoremd-sidebar snoremd-navigation-drawer snoremd-sidebar-mobile"
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop/Tablet: permanent drawer with collapse
  return (
    <Drawer
      variant="permanent"
      open
      className="snoremd-sidebar snoremd-navigation-drawer snoremd-sidebar-desktop"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: currentWidth,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
