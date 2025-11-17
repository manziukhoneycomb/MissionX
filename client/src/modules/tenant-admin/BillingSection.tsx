import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getBillingInfo, getAvailablePlans } from './services/mockBillingService';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';
import BillingCard from './components/BillingCard';
import PlanSelector from './components/PlanSelector';
import PaymentMethodCard from './components/PaymentMethodCard';
import BillingHistoryCard from './components/BillingHistoryCard';

const BILLING_QUERY_KEYS = {
  GET_BILLING_INFO: 'GET_BILLING_INFO',
  GET_AVAILABLE_PLANS: 'GET_AVAILABLE_PLANS',
} as const;

const BillingSection: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: billingData,
    isLoading: billingLoading,
    error: billingError,
  } = useQuery({
    queryKey: [BILLING_QUERY_KEYS.GET_BILLING_INFO],
    queryFn: getBillingInfo,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: [BILLING_QUERY_KEYS.GET_AVAILABLE_PLANS],
    queryFn: getAvailablePlans,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (billingError) {
      enqueueSnackbar(billingError.message || 'Failed to load billing information', {
        variant: 'error',
      });
    }
    if (plansError) {
      enqueueSnackbar(plansError.message || 'Failed to load available plans', {
        variant: 'error',
      });
    }
  }, [billingError, plansError, enqueueSnackbar]);

  const billingInfo = billingData?.data;
  const availablePlans = plansData?.data ?? [];

  if (billingLoading && plansLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      <Alert 
        severity="info" 
        sx={{ mb: 3, backgroundColor: theme.palette.info.light }}
      >
        <Typography variant="body2">
          <strong>Mock Data Notice:</strong> This billing section displays placeholder data for demonstration purposes. 
          In a production environment, this would connect to your billing service provider (Stripe, PayPal, etc.).
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Current Plan Card */}
        <Grid item xs={12} md={6}>
          <BillingCard
            billingInfo={billingInfo}
            isLoading={billingLoading}
          />
        </Grid>

        {/* Payment Method Card */}
        <Grid item xs={12} md={6}>
          <PaymentMethodCard
            billingInfo={billingInfo}
            isLoading={billingLoading}
          />
        </Grid>

        {/* Plan Selector */}
        <Grid item xs={12}>
          <PlanSelector
            availablePlans={availablePlans}
            currentPlan={billingInfo?.currentPlan}
            isLoading={plansLoading}
          />
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <BillingHistoryCard
            billingHistory={billingInfo?.billingHistory ?? []}
            isLoading={billingLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingSection;