import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface CookiesPreferences {
  analytics: boolean;
}

interface CookiesBannerProps {
  onAcceptAll?: () => void;
  onDecline?: () => void;
  onConfigure?: (preferences: CookiesPreferences) => void;
}

const COOKIES_CONSENT_KEY = 'cookies-consent';
const COOKIES_PREFERENCES_KEY = 'cookies-preferences';

const CookiesBanner: React.FC<CookiesBannerProps> = ({
  onAcceptAll,
  onDecline,
  onConfigure,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showBanner, setShowBanner] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [preferences, setPreferences] = useState<CookiesPreferences>({
    analytics: false,
  });

  useEffect(() => {
    const hasConsent = localStorage.getItem(COOKIES_CONSENT_KEY);
    if (!hasConsent) {
      setShowBanner(true);
    }

    const savedPreferences = localStorage.getItem(COOKIES_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = { analytics: true };
    localStorage.setItem(COOKIES_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIES_PREFERENCES_KEY, JSON.stringify(allPreferences));
    setShowBanner(false);
    onAcceptAll?.();
  };

  const handleDecline = () => {
    const declinedPreferences = { analytics: false };
    localStorage.setItem(COOKIES_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIES_PREFERENCES_KEY, JSON.stringify(declinedPreferences));
    setShowBanner(false);
    onDecline?.();
  };

  const handleConfigure = () => {
    setShowConfigDialog(true);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIES_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIES_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowBanner(false);
    setShowConfigDialog(false);
    onConfigure?.(preferences);
  };

  const handlePreferenceChange = (key: keyof CookiesPreferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.snackbar,
          p: { xs: 2, sm: 3 },
          borderRadius: 0,
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Cookie Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We use tracking and analytics cookies to improve your experience and understand how you use our site. 
              You can choose to accept all cookies, decline non-essential ones, or configure your preferences.
            </Typography>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              minWidth: { sm: 'auto' },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleDecline}
              size={isMobile ? 'medium' : 'small'}
            >
              Decline
            </Button>
            <Button
              variant="outlined"
              onClick={handleConfigure}
              size={isMobile ? 'medium' : 'small'}
            >
              Configure
            </Button>
            <Button
              variant="contained"
              onClick={handleAcceptAll}
              size={isMobile ? 'medium' : 'small'}
            >
              Accept All
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Cookie Preferences</Typography>
          <IconButton
            onClick={() => setShowConfigDialog(false)}
            size="small"
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Essential Cookies
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These cookies are necessary for the website to function and cannot be disabled.
            </Typography>
            
            <FormControlLabel
              control={<Switch checked disabled />}
              label={
                <Box>
                  <Typography variant="body2">Essential Cookies</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Required for basic site functionality
                  </Typography>
                </Box>
              }
              sx={{ mb: 3 }}
            />

            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
              Optional Cookies
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.analytics}
                  onChange={handlePreferenceChange('analytics')}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Analytics & Tracking</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Help us understand how you use our site to improve your experience
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowConfigDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookiesBanner;