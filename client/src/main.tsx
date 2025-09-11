import React, { StrictMode } from 'react';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clerkInstance from './common/services/clerkInstance.ts';
import { ThemeProvider } from './common/contexts/ThemeContext';

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


// eslint-disable-next-line react-refresh/only-export-components
const RootComponent: React.FC = () => {
  return (
    <ThemeProvider>
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
