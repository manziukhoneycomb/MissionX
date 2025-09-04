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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { CookiePreferencesService, CookiePreferences, CookieCategory } from '../services/cookiePreferences';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const cookieCategories = [
  {
    key: 'essential' as CookieCategory,
    name: 'Essential',
    description: 'These cookies are necessary for the website to function and cannot be disabled.',
    required: true,
  },
  {
    key: 'analytics' as CookieCategory,
    name: 'Analytics',
    description: 'These cookies help us understand how visitors interact with our website.',
    required: false,
  },
  {
    key: 'marketing' as CookieCategory,
    name: 'Marketing',
    description: 'These cookies are used to deliver personalized advertisements.',
    required: false,
  },
];

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(CookiePreferencesService.getPreferences());
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const hasConsented = CookiePreferencesService.hasConsented();
    setShowBanner(!hasConsented);
  }, []);

  const handleAcceptAll = () => {
    CookiePreferencesService.acceptAll();
    setShowBanner(false);
  };

  const handleDeclineAll = () => {
    CookiePreferencesService.declineAll();
    setShowBanner(false);
  };

  const handleOpenConfig = () => {
    setShowConfigDialog(true);
  };

  const handleCloseConfig = () => {
    setShowConfigDialog(false);
  };

  const handlePreferenceChange = (category: CookieCategory, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: checked,
    }));
  };

  const handleSavePreferences = () => {
    const updatedPreferences: CookiePreferences = {
      ...preferences,
      hasConsented: true,
    };
    CookiePreferencesService.savePreferences(updatedPreferences);
    setShowBanner(false);
    setShowConfigDialog(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.snackbar,
          p: { xs: 1, sm: 2 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            maxWidth: 'lg',
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              gap: { xs: 2, md: 3 },
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  fontWeight: 600,
                }}
              >
                We use cookies
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  lineHeight: 1.5,
                }}
              >
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can customize your preferences or accept all cookies.
              </Typography>
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                minWidth: { md: 'fit-content' },
              }}
            >
              <Button
                variant="outlined"
                size={isMobile ? 'medium' : 'small'}
                onClick={handleDeclineAll}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  order: { xs: 3, sm: 1 },
                }}
              >
                Decline
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? 'medium' : 'small'}
                onClick={handleOpenConfig}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  order: { xs: 2, sm: 2 },
                }}
              >
                Configure
              </Button>
              <Button
                variant="contained"
                size={isMobile ? 'medium' : 'small'}
                onClick={handleAcceptAll}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  order: { xs: 1, sm: 3 },
                }}
              >
                Accept All
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={showConfigDialog}
        onClose={handleCloseConfig}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          Cookie Preferences
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.5 }}
          >
            Choose which cookies you want to accept. Essential cookies are always enabled as they are necessary for the website to function.
          </Typography>
          
          <FormGroup>
            {cookieCategories.map(category => (
              <Box key={category.key} sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={preferences[category.key]}
                      onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                      disabled={category.required}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500 }}>
                        {category.name}
                        {category.required && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1, color: 'text.secondary' }}
                          >
                            (Required)
                          </Typography>
                        )}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}
                      >
                        {category.description}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    alignItems: 'flex-start',
                    '& .MuiFormControlLabel-label': {
                      pt: 0.5,
                    },
                  }}
                />
              </Box>
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseConfig}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreferences}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieBanner;