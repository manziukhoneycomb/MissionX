import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
        sx={{
          ml: 1,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(180deg)',
          },
        }}
      >
        {mode === 'dark' ? (
          <LightModeIcon sx={{ color: '#FbbF24' }} />
        ) : (
          <DarkModeIcon sx={{ color: '#64748B' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;