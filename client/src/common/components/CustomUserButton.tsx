import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useClerk, useUser } from '@clerk/clerk-react';

type CustomUserButtonProps = {
  afterSignOutUrl: string;
};

const CustomUserButton: React.FC<CustomUserButtonProps> = ({ afterSignOutUrl }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();
  const { user } = useUser();
  const theme = useTheme();

  const handleClick = (): void => {
    setAnchorEl(buttonRef.current);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleSignOut = (): void => {
    signOut(() => {
      window.location.href = afterSignOutUrl;
    });
    handleClose();
  };

  const handleManageAccount = (): void => {
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        ref={buttonRef}
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          borderRadius: '50%',
          padding: '2px',
          transition: theme.transitions.create(['background-color', 'box-shadow'], {
            duration: theme.transitions.duration.shortest,
          }),
          '&:hover': {
            backgroundColor: 'rgba(31, 184, 170, 0.08)',
          },
        }}>
        <Avatar
          src={user?.imageUrl}
          alt={user?.firstName || 'User'}
          sx={{
            width: 36,
            height: 36,
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        />
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 320,
            mt: 1,
            px: 0,
            pt: 2,
            pb: 1,
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            backgroundImage: 'none',
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 1.5,
            pl: 2,
          }}>
          <Avatar
            src={user?.imageUrl}
            alt={user?.firstName || 'User'}
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          />
          <Box>
            <Tooltip title={user?.emailAddresses[0]?.emailAddress || ''}>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.primary,
                  maxWidth: 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  textShadow: 'none',
                }}>
                {user?.emailAddresses[0]?.emailAddress}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleManageAccount}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(31, 184, 170, 0.05)',
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Manage account" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleSignOut}
              sx={{
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(31, 184, 170, 0.05)',
                },
              }}>
              <ListItemIcon sx={{ minWidth: 36, color: theme.palette.primary.main }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </>
  );
};

export default CustomUserButton;
