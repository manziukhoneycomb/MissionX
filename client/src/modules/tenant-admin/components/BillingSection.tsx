import React from 'react';
import {
  Box,
  Card,
  CardContent,
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
  useTheme,
  Alert,
  Divider,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useQuery } from '@tanstack/react-query';
import { getTenantBilling } from '../tenantAdminQueries';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';

const BillingSection: React.FC = () => {
  const theme = useTheme();

  // Mock query for billing data - replace with real implementation later
  const { data: billingData, isLoading } = useQuery({
    queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_TENANT_BILLING],
    queryFn: getTenantBilling,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  // Mock billing data structure
  const mockBillingData = billingData || {
    subscription: {
      plan: 'Professional',
      status: 'active',
      nextBillingDate: '2024-12-01',
      amount: 99.99,
      currency: 'USD',
    },
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryDate: '12/26',
    },
    invoices: [
      {
        id: 'inv_001',
        date: '2024-11-01',
        amount: 99.99,
        status: 'paid',
        downloadUrl: '#',
      },
      {
        id: 'inv_002',
        date: '2024-10-01',
        amount: 99.99,
        status: 'paid',
        downloadUrl: '#',
      },
      {
        id: 'inv_003',
        date: '2024-09-01',
        amount: 99.99,
        status: 'paid',
        downloadUrl: '#',
      },
    ],
    usage: {
      currentUsers: 12,
      maxUsers: 25,
      storageUsed: 2.4,
      maxStorage: 10,
      apiCallsThisMonth: 8500,
      apiCallsLimit: 15000,
    },
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ px: 3 }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
        Billing & Subscription
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This billing section shows mock data for demonstration purposes. Integration with actual billing provider will be implemented in a future update.
      </Alert>

      <Grid container spacing={3}>
        {/* Subscription Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" component="h3">
                  Current Subscription
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {mockBillingData.subscription.plan}
              </Typography>
              <Chip
                label={mockBillingData.subscription.status.toUpperCase()}
                color={getStatusColor(mockBillingData.subscription.status) as any}
                size="small"
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Next billing date: {formatDate(mockBillingData.subscription.nextBillingDate)}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {formatCurrency(mockBillingData.subscription.amount, mockBillingData.subscription.currency)}/month
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Change Plan
                </Button>
                <Button variant="outlined" size="small">
                  Cancel Subscription
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Method */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" component="h3">
                  Payment Method
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="body1">
                    {mockBillingData.paymentMethod.brand} ending in {mockBillingData.paymentMethod.last4}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expires {mockBillingData.paymentMethod.expiryDate}
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" size="small">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                Usage Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Users
                    </Typography>
                    <Typography variant="h6">
                      {mockBillingData.usage.currentUsers} / {mockBillingData.usage.maxUsers}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Storage
                    </Typography>
                    <Typography variant="h6">
                      {mockBillingData.usage.storageUsed} GB / {mockBillingData.usage.maxStorage} GB
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      API Calls (This Month)
                    </Typography>
                    <Typography variant="h6">
                      {mockBillingData.usage.apiCallsThisMonth.toLocaleString()} / {mockBillingData.usage.apiCallsLimit.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Plan Utilization
                    </Typography>
                    <Typography variant="h6" color={theme.palette.success.main}>
                      Normal
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" component="h3">
                    Recent Invoices
                  </Typography>
                </Box>
                <Button variant="outlined" size="small">
                  View All Invoices
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockBillingData.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>
                          {formatCurrency(invoice.amount, mockBillingData.subscription.currency)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status.toUpperCase()}
                            color={getStatusColor(invoice.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            href={invoice.downloadUrl}
                            download>
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingSection;