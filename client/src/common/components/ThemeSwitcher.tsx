import React from 'react';
import { Box, IconButton, Switch, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          sx={{
            p: 0.5,
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {isDark ? <LightMode /> : <DarkMode />}
        </IconButton>
      </Tooltip>
      <Switch
        checked={isDark}
        onChange={toggleTheme}
        size="small"
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(31, 184, 170, 0.08)',
            },
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'primary.main',
          },
        }}
      />
    </Box>
  );
};

export default ThemeSwitcher;