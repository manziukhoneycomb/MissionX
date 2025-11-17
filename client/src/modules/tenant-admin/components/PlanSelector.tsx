import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Skeleton,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingPlan, changePlan } from '../services/mockBillingService';

interface PlanSelectorProps {
  availablePlans: BillingPlan[];
  currentPlan?: BillingPlan;
  isLoading: boolean;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ availablePlans, currentPlan, isLoading }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);

  const { mutateAsync: changePlanMutate, isPending: isChangingPlan } = useMutation({
    mutationFn: changePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BILLING_INFO'] });
      enqueueSnackbar('Plan changed successfully!', { variant: 'success' });
      setConfirmDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to change plan', { variant: 'error' });
    },
  });

  const handlePlanSelect = (plan: BillingPlan) => {
    if (plan.id === currentPlan?.id) return;
    setSelectedPlan(plan);
    setConfirmDialogOpen(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    await changePlanMutate(selectedPlan.id);
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader
          title={<Skeleton variant="text" width="30%" />}
          subheader={<Skeleton variant="text" width="50%" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Choose Your Plan
            </Typography>
          }
          subheader="Select the plan that best fits your needs"
        />
        <CardContent>
          <Grid container spacing={3}>
            {availablePlans.map((plan) => {
              const isCurrentPlan = plan.id === currentPlan?.id;
              const isPlanUpgrade = currentPlan && plan.price > currentPlan.price;
              const isPlanDowngrade = currentPlan && plan.price < currentPlan.price;

              return (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: isCurrentPlan 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      backgroundColor: isCurrentPlan 
                        ? theme.palette.primary.light + '10'
                        : theme.palette.background.paper,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: isCurrentPlan ? 'none' : 'translateY(-4px)',
                        boxShadow: isCurrentPlan ? undefined : theme.shadows[8],
                      },
                    }}
                  >
                    {plan.isPopular && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: 16,
                          backgroundColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        <StarIcon sx={{ fontSize: '0.875rem' }} />
                        Most Popular
                      </Box>
                    )}

                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {plan.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                          <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            ${plan.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /{plan.billingCycle}
                          </Typography>
                        </Box>
                      </Box>

                      <List dense sx={{ flexGrow: 1, mb: 2 }}>
                        {plan.features.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon 
                                sx={{ 
                                  fontSize: 20, 
                                  color: theme.palette.success.main 
                                }} 
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Box sx={{ mt: 'auto' }}>
                        {isCurrentPlan ? (
                          <Chip
                            label="Current Plan"
                            color="primary"
                            sx={{ width: '100%', height: 40 }}
                          />
                        ) : (
                          <Button
                            variant={plan.isPopular ? 'contained' : 'outlined'}
                            fullWidth
                            onClick={() => handlePlanSelect(plan)}
                            sx={{ 
                              height: 40,
                              fontWeight: 'bold',
                              ...(isPlanUpgrade && {
                                backgroundColor: theme.palette.success.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.success.dark,
                                },
                              }),
                              ...(isPlanDowngrade && {
                                backgroundColor: theme.palette.warning.main,
                                '&:hover': {
                                  backgroundColor: theme.palette.warning.dark,
                                },
                              }),
                            }}
                          >
                            {isPlanUpgrade ? 'Upgrade' : isPlanDowngrade ? 'Downgrade' : 'Select Plan'}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      <Dialog 
        open={confirmDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedPlan && currentPlan && selectedPlan.price > currentPlan.price 
            ? 'Confirm Plan Upgrade' 
            : 'Confirm Plan Change'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedPlan && currentPlan && (
              <>
                You are about to change from <strong>{currentPlan.name}</strong> (${currentPlan.price}/{currentPlan.billingCycle}) 
                to <strong>{selectedPlan.name}</strong> (${selectedPlan.price}/{selectedPlan.billingCycle}).
              </>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Changes will take effect immediately, and your next bill will be prorated accordingly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isChangingPlan}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPlanChange}
            variant="contained"
            disabled={isChangingPlan}
            startIcon={isChangingPlan ? <CircularProgress size={16} /> : null}
          >
            {isChangingPlan ? 'Processing...' : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlanSelector;