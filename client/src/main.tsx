import React, { StrictMode } from 'react';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clerkInstance from './common/services/clerkInstance.ts';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;
axios.interceptors.request.use(
  async (config) => {
    try {
      if (clerkInstance) {
        const token = await clerkInstance.session?.getToken();

        if (token) {
          config.headers.Authorization = token;
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Custom theme with invoice analytics design system
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1fb8aa',
      light: '#3fc9bc',
      dark: '#0d9488',
      contrastText: '#000000',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3f1',
      dark: '#0e7490',
      contrastText: '#000000',
    },
    background: {
      default: '#0F172A', // Slate-900
      paper: '#1E293B', // Slate-800
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8', // Slate-400
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
    divider: '#334155', // Slate-700
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
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #334155',
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
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#334155',
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

// eslint-disable-next-line react-refresh/only-export-components
const RootComponent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <App />
          </ClerkProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
