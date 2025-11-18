import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import { useQuery } from '@tanstack/react-query';
import { mockBillingService, AvailablePlan } from '../services/mockBillingService';

interface PlanSelectorProps {
  currentPlanId: string;
  onPlanSelect: (planId: string) => void;
  isChanging: boolean;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  currentPlanId,
  onPlanSelect,
  isChanging
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: availablePlans,
    isLoading,
    error: plansError,
  } = useQuery({
    queryKey: ['available-plans'],
    queryFn: mockBillingService.getAvailablePlans,
  });

  useEffect(() => {
    if (plansError) {
      enqueueSnackbar(plansError.message || 'Failed to load available plans', {
        variant: 'error',
      });
    }
  }, [plansError, enqueueSnackbar]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!availablePlans) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ py: 4 }}>
        Failed to load available plans
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {availablePlans.map((plan: AvailablePlan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          const isPopular = plan.popular;

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isCurrentPlan
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                {isPopular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      icon={<StarIcon />}
                      label="Most Popular"
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
                {isCurrentPlan && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      label="Current Plan"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(plan.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per {plan.interval}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, mb: 3 }}>
                    <List dense>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Button
                    variant={isCurrentPlan ? 'outlined' : 'contained'}
                    fullWidth
                    disabled={isCurrentPlan || isChanging}
                    onClick={() => onPlanSelect(plan.id)}
                    sx={{
                      mt: 'auto',
                      ...(isPopular && !isCurrentPlan && {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                        },
                      }),
                    }}
                  >
                    {isChanging ? (
                      <CircularProgress size={24} />
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Note:</strong> This is a demo billing interface. Plan changes and payment processing are simulated for demonstration purposes.
        </Typography>
      </Box>
    </Box>
  );
};

export default PlanSelector;