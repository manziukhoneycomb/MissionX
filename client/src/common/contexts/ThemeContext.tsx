import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'invoice-analytics-theme';

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
};

const createAppTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1fb8aa',
        light: '#3fc9bc',
        dark: '#0d9488',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: '#06b6d4',
        light: '#22d3f1',
        dark: '#0e7490',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC', // Dark: Slate-900, Light: Slate-50
        paper: isDark ? '#1E293B' : '#FFFFFF', // Dark: Slate-800, Light: White
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#0F172A', // Dark: White, Light: Slate-900
        secondary: isDark ? '#94A3B8' : '#64748B', // Dark: Slate-400, Light: Slate-500
      },
      error: {
        main: '#EF4444', // Red-500
      },
      warning: {
        main: '#F59E0B', // Amber-500
      },
      info: {
        main: '#3B82F6', // Blue-500
      },
      success: {
        main: '#10B981', // Emerald-500
      },
      divider: isDark ? '#334155' : '#E2E8F0', // Dark: Slate-700, Light: Slate-200
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
            boxShadow: isDark 
              ? '0 4px 6px rgba(0, 0, 0, 0.1)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
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
            boxShadow: isDark 
              ? '0 2px 4px rgba(0, 0, 0, 0.1)' 
              : '0 1px 2px rgba(0, 0, 0, 0.05)',
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#0F172A',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isDark ? '#334155' : '#E2E8F0',
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
};

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = React.useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};