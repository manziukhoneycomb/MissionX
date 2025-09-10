import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme-mode';

const createAppTheme = (mode: ThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1fb8aa',
        light: '#3fc9bc',
        dark: '#0d9488',
        contrastText: mode === 'light' ? '#FFFFFF' : '#000000',
      },
      secondary: {
        main: '#06b6d4',
        light: '#22d3f1',
        dark: '#0e7490',
        contrastText: mode === 'light' ? '#FFFFFF' : '#000000',
      },
      background: {
        default: mode === 'light' ? '#FFFFFF' : '#0F172A',
        paper: mode === 'light' ? '#F8FAFC' : '#1E293B',
      },
      text: {
        primary: mode === 'light' ? '#1E293B' : '#FFFFFF',
        secondary: mode === 'light' ? '#64748B' : '#94A3B8',
      },
      error: {
        main: '#EF4444',
      },
      warning: {
        main: '#F59E0B',
      },
      info: {
        main: '#3B82F6',
      },
      success: {
        main: '#10B981',
      },
      divider: mode === 'light' ? '#E2E8F0' : '#334155',
    },
    typography: {
      fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            padding: '8px 16px',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background: 'linear-gradient(to right, #1fb8aa, #0d9488)',
            '&:hover': {
              background: 'linear-gradient(to right, #0d9488, #0f766e)',
            },
          },
          outlined: {
            borderColor: '#1fb8aa',
            color: '#1fb8aa',
            '&:hover': {
              borderColor: '#0d9488',
              color: '#0d9488',
              backgroundColor: 'rgba(13, 148, 136, 0.04)',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1fb8aa',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1fb8aa',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: 'rgba(31, 184, 170, 0.1)',
            },
            '&.Mui-selected:hover': {
              backgroundColor: 'rgba(31, 184, 170, 0.2)',
            },
            '&:hover': {
              backgroundColor: 'rgba(31, 184, 170, 0.05)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === 'light'
                ? '0 4px 6px rgba(0, 0, 0, 0.1)'
                : '0 4px 6px rgba(0, 0, 0, 0.3)',
            border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: mode === 'light' ? '#1E293B' : '#FFFFFF',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'light' ? '#E2E8F0' : '#334155',
              },
              '&:hover fieldset': {
                borderColor: '#1fb8aa',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1fb8aa',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  });

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};