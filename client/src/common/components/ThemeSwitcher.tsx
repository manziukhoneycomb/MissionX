import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        size="medium"
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;