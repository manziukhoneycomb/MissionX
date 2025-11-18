import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BillingCard from './components/BillingCard';
import PlanSelector from './components/PlanSelector';
import { mockBillingService, BillingInfo, BillingPlan } from './services/mockBillingService';

const BillingSection: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const [billing, plans] = await Promise.all([
          mockBillingService.getBillingInfo(),
          mockBillingService.getAvailablePlans(),
        ]);
        setBillingInfo(billing);
        setAvailablePlans(plans);
      } catch (error) {
        enqueueSnackbar('Failed to load billing information', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [enqueueSnackbar]);

  const handlePlanChange = async (planId: string) => {
    if (!billingInfo) return;

    try {
      await mockBillingService.changePlan(planId);
      const updatedBilling = await mockBillingService.getBillingInfo();
      setBillingInfo(updatedBilling);
      enqueueSnackbar('Plan changed successfully', { variant: 'success' });
      setShowPlans(false);
    } catch (error) {
      enqueueSnackbar('Failed to change plan', { variant: 'error' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!billingInfo) {
    return (
      <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Failed to load billing information
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3 }}>
      {showPlans ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Choose Your Plan
            </Typography>
            <Button variant="outlined" onClick={() => setShowPlans(false)}>
              Back to Billing
            </Button>
          </Box>
          <PlanSelector
            plans={availablePlans}
            currentPlanId={billingInfo.currentPlan.id}
            onPlanChange={handlePlanChange}
          />
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Billing & Subscription
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <BillingCard
                title="Current Plan"
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => setShowPlans(true)}>
                    Change Plan
                  </Button>
                }>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {billingInfo.currentPlan.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(billingInfo.currentPlan.price)}/{billingInfo.currentPlan.interval.slice(0, -2)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <strong>Next billing date:</strong> {formatDate(billingInfo.nextBillingDate)}
                </Typography>
              </BillingCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <BillingCard
                title="Usage Overview"
                metrics={[
                  {
                    label: 'Active Users',
                    current: billingInfo.usageMetrics.usersCount,
                    limit: billingInfo.usageMetrics.usersLimit,
                  },
                  {
                    label: 'Invoices Processed',
                    current: billingInfo.usageMetrics.invoicesProcessed,
                    limit: billingInfo.usageMetrics.invoicesLimit,
                  },
                  {
                    label: 'Storage Used',
                    current: billingInfo.usageMetrics.storageUsedGB,
                    limit: billingInfo.usageMetrics.storageLimit,
                    unit: 'GB',
                  },
                ]}
              />
            </Grid>

            <Grid item xs={12}>
              <BillingCard
                title="Payment Methods"
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CreditCardIcon />}>
                    Add Payment Method
                  </Button>
                }>
                {billingInfo.paymentMethods.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No payment methods on file
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {billingInfo.paymentMethods.map((method) => (
                      <Box
                        key={method.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          ...(method.isDefault && {
                            border: `2px solid ${theme.palette.primary.main}`,
                          }),
                        }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CreditCardIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {method.brand} •••• {method.last4}
                            </Typography>
                            {method.expiryMonth && method.expiryYear && (
                              <Typography variant="caption" color="text.secondary">
                                Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                              </Typography>
                            )}
                          </Box>
                          {method.isDefault && (
                            <Chip
                              icon={<StarIcon />}
                              label="Default"
                              size="small"
                              color="primary"
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                )}
              </BillingCard>
            </Grid>

            <Grid item xs={12}>
              <BillingCard
                title="Billing History"
                action={
                  <Tooltip title="View All">
                    <IconButton size="small">
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                }>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingInfo.billingHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(invoice.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              size="small"
                              color={getStatusColor(invoice.status)}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </BillingCard>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default BillingSection;