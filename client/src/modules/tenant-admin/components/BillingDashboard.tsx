import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { getBillingInfo } from '../billingQueries';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { BillingInfo, PaymentMethod, Subscription } from '../types/billing';
import AddPaymentMethodDialog from './AddPaymentMethodDialog';

const BillingDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);

  const {
    data: billingData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_BILLING_INFO],
    queryFn: getBillingInfo,
    staleTime: CACHE_TIMES.DEFAULT,
    retry: 1,
  });

  const billing: BillingInfo | null = billingData?.data ?? null;

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Assuming amount is in cents
  };

  const renderPaymentMethod = (paymentMethod: PaymentMethod) => {
    const { type, last4, brand, expiryMonth, expiryYear, isDefault, holderName } = paymentMethod;
    
    return (
      <Paper 
        key={paymentMethod.id} 
        sx={{ p: 2, border: isDefault ? 2 : 1, borderColor: isDefault ? 'primary.main' : 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CreditCardIcon color={isDefault ? 'primary' : 'inherit'} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {type === 'card' ? `${brand} •••• ${last4}` : `Bank •••• ${last4}`}
            </Typography>
            {holderName && (
              <Typography variant="body2" color="text.secondary">
                {holderName}
              </Typography>
            )}
            {type === 'card' && expiryMonth && expiryYear && (
              <Typography variant="body2" color="text.secondary">
                Expires {String(expiryMonth).padStart(2, '0')}/{expiryYear}
              </Typography>
            )}
            {isDefault && (
              <Chip label="Default" size="small" color="primary" sx={{ mt: 1 }} />
            )}
          </Box>
          <IconButton size="small">
            <SettingsIcon />
          </IconButton>
        </Stack>
      </Paper>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load billing information. This feature may not be available yet.
      </Alert>
    );
  }

  if (!billing) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No billing information available. Billing features are coming soon.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Subscription Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Current Subscription" />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6">{billing.subscription.planName}</Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(billing.subscription.planPrice)}
                    <Typography component="span" variant="body1" color="text.secondary">
                      /{billing.subscription.planInterval}
                    </Typography>
                  </Typography>
                </Box>
                
                <Box>
                  <Chip
                    label={billing.subscription.status}
                    color={getSubscriptionStatusColor(billing.subscription.status)}
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    Current period: {formatDate(billing.subscription.currentPeriodStart)} - {formatDate(billing.subscription.currentPeriodEnd)}
                  </Typography>
                  
                  {billing.subscription.cancelAtPeriodEnd && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Subscription will cancel at the end of the current period
                    </Alert>
                  )}
                  
                  {billing.subscription.trialEnd && (
                    <Typography variant="body2" color="text.secondary">
                      Trial ends: {formatDate(billing.subscription.trialEnd)}
                    </Typography>
                  )}
                </Box>

                <Button variant="outlined" fullWidth>
                  Manage Subscription
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Invoice */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Next Invoice" />
            <CardContent>
              {billing.upcomingInvoice ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(billing.upcomingInvoice.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due {formatDate(billing.upcomingInvoice.dueDate)}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={billing.upcomingInvoice.status}
                    color={getInvoiceStatusColor(billing.upcomingInvoice.status)}
                  />
                  
                  <Button variant="outlined" fullWidth>
                    View Invoice Details
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming invoices
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Payment Methods"
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddPaymentDialogOpen(true)}
                >
                  Add Payment Method
                </Button>
              }
            />
            <CardContent>
              {billing.paymentMethods.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No payment methods added yet
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {billing.paymentMethods.map((paymentMethod) => (
                    <Grid item xs={12} sm={6} md={4} key={paymentMethod.id}>
                      {renderPaymentMethod(paymentMethod)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Billing History" />
            <CardContent sx={{ p: 0 }}>
              {billing.billingHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No billing history available
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billing.billingHistory.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={getInvoiceStatusColor(invoice.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {invoice.downloadUrl && (
                              <Tooltip title="Download Invoice">
                                <IconButton 
                                  size="small"
                                  href={invoice.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AddPaymentMethodDialog
        open={isAddPaymentDialogOpen}
        onClose={() => setIsAddPaymentDialogOpen(false)}
      />
    </Box>
  );
};

export default BillingDashboard;