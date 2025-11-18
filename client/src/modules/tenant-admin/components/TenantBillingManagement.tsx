import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  useTheme,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useQuery } from '@tanstack/react-query';
import { getTenantBillingInfo, getTenantInvoices } from '../tenantAdminQueries';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

interface BillingInfo {
  currentPlan: string;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  nextBillingDate: string;
  monthlySpend: number;
  usageThisMonth: {
    users: number;
    storage: number; // in GB
    apiCalls: number;
  };
  limits: {
    users: number;
    storage: number; // in GB
    apiCalls: number;
  };
  paymentMethod?: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

const TenantBillingManagement: React.FC = () => {
  const theme = useTheme();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  const {
    data: billingData,
    isLoading: billingLoading,
    error: billingError,
  } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_BILLING_INFO],
    queryFn: getTenantBillingInfo,
    staleTime: CACHE_TIMES.BILLING,
  });

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
  } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_INVOICES],
    queryFn: getTenantInvoices,
    staleTime: CACHE_TIMES.BILLING,
  });

  const billingInfo: BillingInfo | undefined = billingData?.data;
  const invoices: Invoice[] = invoicesData?.data ?? [];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'trial':
        return 'info';
      case 'past_due':
      case 'pending':
        return 'warning';
      case 'canceled':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUsagePercentage = (used: number, limit: number): number => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return theme.palette.error.main;
    if (percentage >= 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  if (billingError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load billing information. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Current Plan & Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Current Plan</Typography>
              </Box>
              {billingLoading ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {billingInfo?.currentPlan || 'Free Plan'}
                  </Typography>
                  <Chip
                    label={billingInfo?.status || 'active'}
                    color={getStatusColor(billingInfo?.status || 'active') as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Next billing: {billingInfo?.nextBillingDate ? formatDate(billingInfo.nextBillingDate) : 'N/A'}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => setIsUpgradeDialogOpen(true)}>
                    Upgrade Plan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spend */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6">This Month</Typography>
              </Box>
              {billingLoading ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {formatCurrency(billingInfo?.monthlySpend || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current month spending
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                <Typography variant="h6">Payment Method</Typography>
              </Box>
              {billingLoading ? (
                <Typography>Loading...</Typography>
              ) : billingInfo?.paymentMethod ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {billingInfo.paymentMethod.brand || billingInfo.paymentMethod.type} •••• {billingInfo.paymentMethod.last4}
                  </Typography>
                  {billingInfo.paymentMethod.expiryMonth && billingInfo.paymentMethod.expiryYear && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setIsPaymentDialogOpen(true)}>
                    Update Payment
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No payment method on file
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setIsPaymentDialogOpen(true)}>
                    Add Payment Method
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Overview */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Usage Overview" />
            <CardContent>
              {billingLoading ? (
                <Typography>Loading usage data...</Typography>
              ) : billingInfo ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Users
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {billingInfo.usageThisMonth.users} / {billingInfo.limits.users}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}>
                      <Box
                        sx={{
                          width: `${getUsagePercentage(billingInfo.usageThisMonth.users, billingInfo.limits.users)}%`,
                          height: '100%',
                          backgroundColor: getUsageColor(getUsagePercentage(billingInfo.usageThisMonth.users, billingInfo.limits.users)),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      Storage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {billingInfo.usageThisMonth.storage} GB / {billingInfo.limits.storage} GB
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}>
                      <Box
                        sx={{
                          width: `${getUsagePercentage(billingInfo.usageThisMonth.storage, billingInfo.limits.storage)}%`,
                          height: '100%',
                          backgroundColor: getUsageColor(getUsagePercentage(billingInfo.usageThisMonth.storage, billingInfo.limits.storage)),
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" gutterBottom>
                      API Calls
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">
                        {billingInfo.usageThisMonth.apiCalls.toLocaleString()} / {billingInfo.limits.apiCalls.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}>
                      <Box
                        sx={{
                          width: `${getUsagePercentage(billingInfo.usageThisMonth.apiCalls, billingInfo.limits.apiCalls)}%`,
                          height: '100%',
                          backgroundColor: getUsageColor(getUsagePercentage(billingInfo.usageThisMonth.apiCalls, billingInfo.limits.apiCalls)),
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">No usage data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Recent Invoices" />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {invoicesLoading ? (
                <Box sx={{ p: 3 }}>
                  <Typography>Loading invoices...</Typography>
                </Box>
              ) : invoices.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.slice(0, 5).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              color={getStatusColor(invoice.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {invoice.downloadUrl && (
                              <Button size="small" variant="outlined">
                                Download
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No invoices found</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Update Payment Method Dialog */}
      <Dialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Update Payment Method</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Payment method management will be integrated with your payment processor in a future update.
            </Alert>
            <TextField
              fullWidth
              label="Card Number"
              placeholder="•••• •••• •••• ••••"
              sx={{ mb: 2 }}
              disabled
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="MM/YY"
                placeholder="12/25"
                sx={{ flex: 1 }}
                disabled
              />
              <TextField
                label="CVC"
                placeholder="123"
                sx={{ flex: 1 }}
                disabled
              />
            </Box>
            <TextField
              fullWidth
              label="Cardholder Name"
              sx={{ mb: 3 }}
              disabled
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" disabled>
                Update Payment Method
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog
        open={isUpgradeDialogOpen}
        onClose={() => setIsUpgradeDialogOpen(false)}
        maxWidth="md"
        fullWidth>
        <DialogTitle>Upgrade Your Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Plan management and billing integration will be available in a future update.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Plan
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      $29/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Up to 50 users
                      • 100 GB storage
                      • 100,000 API calls/month
                      • Priority support
                    </Typography>
                    <Button variant="outlined" fullWidth disabled>
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Enterprise Plan
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      $99/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      • Unlimited users
                      • 1 TB storage
                      • Unlimited API calls
                      • 24/7 dedicated support
                      • Custom integrations
                    </Typography>
                    <Button variant="contained" fullWidth disabled>
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={() => setIsUpgradeDialogOpen(false)}>
                Close
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TenantBillingManagement;