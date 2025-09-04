import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, Theme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const createAppTheme = (mode: ThemeMode): Theme => {
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
        default: isDark ? '#0F172A' : '#ffffff',
        paper: isDark ? '#1E293B' : '#ffffff',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#1F2937',
        secondary: isDark ? '#94A3B8' : '#6B7280',
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
      divider: isDark ? '#334155' : '#E5E7EB',
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
            boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
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
            boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: isDark ? '#FFFFFF' : '#1F2937',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isDark ? '#334155' : '#E5E7EB',
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

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    return savedMode || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};