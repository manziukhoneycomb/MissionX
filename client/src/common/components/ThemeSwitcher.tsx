import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;