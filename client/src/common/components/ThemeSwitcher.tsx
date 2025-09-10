import React from 'react';
import { IconButton, Switch, Box, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'icon';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = 'toggle' }) => {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  if (variant === 'icon') {
    return (
      <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          sx={{
            ml: 1,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              backgroundColor: 'action.hover',
            },
          }}>
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          ml: 1,
          py: 0.5,
          px: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}>
        <Brightness7 sx={{ mr: 0.5, fontSize: '1.2rem', color: 'text.secondary' }} />
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          size="small"
          sx={{
            mx: 0.5,
            '& .MuiSwitch-switchBase': {
              color: 'text.secondary',
              '&.Mui-checked': {
                color: 'primary.main',
              },
              '&.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'primary.main',
                opacity: 0.5,
              },
            },
            '& .MuiSwitch-track': {
              backgroundColor: 'text.secondary',
              opacity: 0.3,
            },
          }}
        />
        <Brightness4 sx={{ ml: 0.5, fontSize: '1.2rem', color: 'text.secondary' }} />
      </Box>
    </Tooltip>
  );
};

export default ThemeSwitcher;