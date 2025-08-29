import React, { useState } from 'react';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CustomUserButton from './CustomUserButton';
import useUserRoles from '../hooks/useUserRoles';
import { ROLES } from '../constants/roles';
import InvoiceFileUpload from '../../modules/invoices/components/InvoiceFileUpload';

const drawerWidth = 240;

type NavItem = {
  label: string;
  path: string;
  icon?: React.ReactElement;
  roles?: string[];
};

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRoles = useUserRoles();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems: NavItem[] = [
    { label: 'Invoices', path: '/invoice-management', roles: [ROLES.SUPER_ADMIN] },
    { label: 'Tenants', path: '/tenant-management', roles: [ROLES.SUPER_ADMIN] },
    { label: 'Users', path: '/user-management', roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    { label: 'Secrets', path: '/secrets', roles: [ROLES.ADMIN] },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    return item.roles.some((x) => userRoles.includes(x));
  });

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <img src="/icon.svg" alt="App Logo" style={{ height: 32, margin: '16px 0' }} />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={RouterNavLink}
              to={item.path}
              sx={(theme) => ({
                textAlign: 'left',
                '&.active': {
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  backgroundColor: theme.palette.action.selected,
                },
              })}>
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 'auto', marginRight: 1, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
        }}>
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ px: { xs: 1, sm: 2 } }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <RouterNavLink
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}>
              <img
                src="/icon.svg"
                alt="App Logo"
                style={{ height: 32, marginRight: theme.spacing(1) }}
              />
              <Typography variant="h6" noWrap component="div">
                Invoice Analytics
              </Typography>
            </RouterNavLink>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {!userRoles.includes(ROLES.SUPER_ADMIN) && <InvoiceFileUpload variant="text" />}
              {filteredNavItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterNavLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={(theme) => ({
                    color: 'text.secondary',
                    ml: 1,
                    textTransform: 'none',
                    '&.active': {
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                    },
                  })}>
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ ml: { xs: 1, md: 2 } }}>
              <CustomUserButton afterSignOutUrl="/" />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}>
          {drawer}
        </Drawer>
      </Box>

      <Container
        component="main"
        maxWidth={false}
        sx={{ mt: 4, mb: 4, flexGrow: 1, px: { xs: 1, sm: 2, md: 3 } }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: { xs: 1, sm: 2, md: 3 },
          mt: 'auto',
          backgroundColor: (theme: Theme) =>
            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            Invoice Analytics {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
