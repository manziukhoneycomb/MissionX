import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import ApiIcon from '@mui/icons-material/Api';
import BillingCard from './components/BillingCard';
import PlanSelector from './components/PlanSelector';
import { mockBillingService, BillingInfo } from './services/mockBillingService';

const BILLING_QUERY_KEYS = {
  GET_BILLING_INFO: 'billing-info',
  GET_AVAILABLE_PLANS: 'available-plans'
};

const BillingSection: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);

  const {
    data: billingInfo,
    isLoading,
    error: billingError,
  } = useQuery({
    queryKey: [BILLING_QUERY_KEYS.GET_BILLING_INFO],
    queryFn: mockBillingService.getBillingInfo,
  });

  const { mutateAsync: changePlanMutate, isPending: isChangingPlan } = useMutation({
    mutationFn: mockBillingService.changePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLING_QUERY_KEYS.GET_BILLING_INFO] });
      enqueueSnackbar('Plan changed successfully', { variant: 'success' });
      setIsPlanSelectorOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to change plan', { variant: 'error' });
    },
  });

  useEffect(() => {
    if (billingError) {
      enqueueSnackbar(billingError.message || 'Failed to load billing information', {
        variant: 'error',
      });
    }
  }, [billingError, enqueueSnackbar]);

  const getUsagePercentage = (current: number, limit: number): number => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): 'primary' | 'warning' | 'error' => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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

  if (!billingInfo) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ py: 4 }}>
        Failed to load billing information
      </Typography>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  <Typography variant="h6">Current Plan & Usage</Typography>
                </Box>
              }
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h3">
                    {billingInfo.currentPlan.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setIsPlanSelectorOpen(true)}
                  >
                    Change Plan
                  </Button>
                </Box>
                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                  {formatCurrency(billingInfo.currentPlan.price)}
                  <Typography component="span" variant="body1" color="text.secondary">
                    /{billingInfo.currentPlan.interval}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Next billing date: {formatDate(billingInfo.nextBillingDate)}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <PeopleIcon fontSize="small" />
                      <Typography variant="subtitle2">Users</Typography>
                    </Box>
                    <Typography variant="h6">
                      {billingInfo.usage.users.current} / {billingInfo.usage.users.limit}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(billingInfo.usage.users.current, billingInfo.usage.users.limit)}
                      color={getUsageColor(getUsagePercentage(billingInfo.usage.users.current, billingInfo.usage.users.limit))}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <StorageIcon fontSize="small" />
                      <Typography variant="subtitle2">Storage</Typography>
                    </Box>
                    <Typography variant="h6">
                      {billingInfo.usage.storage.current} / {billingInfo.usage.storage.limit} {billingInfo.usage.storage.unit}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(billingInfo.usage.storage.current, billingInfo.usage.storage.limit)}
                      color={getUsageColor(getUsagePercentage(billingInfo.usage.storage.current, billingInfo.usage.storage.limit))}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ApiIcon fontSize="small" />
                      <Typography variant="subtitle2">API Calls</Typography>
                    </Box>
                    <Typography variant="h6">
                      {billingInfo.usage.apiCalls.current.toLocaleString()} / {billingInfo.usage.apiCalls.limit.toLocaleString()}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getUsagePercentage(billingInfo.usage.apiCalls.current, billingInfo.usage.apiCalls.limit)}
                      color={getUsageColor(getUsagePercentage(billingInfo.usage.apiCalls.current, billingInfo.usage.apiCalls.limit))}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon />
                  <Typography variant="h6">Payment Method & Billing History</Typography>
                </Box>
              }
            />
            <CardContent>
              <BillingCard billingInfo={billingInfo} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Plan Features" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                {billingInfo.currentPlan.features.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    size="small"
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={isPlanSelectorOpen}
        onClose={() => setIsPlanSelectorOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Choose Your Plan</DialogTitle>
        <DialogContent>
          <PlanSelector
            currentPlanId={billingInfo.currentPlan.id}
            onPlanSelect={(planId) => changePlanMutate(planId)}
            isChanging={isChangingPlan}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPlanSelectorOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingSection;