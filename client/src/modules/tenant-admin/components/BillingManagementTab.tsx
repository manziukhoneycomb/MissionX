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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Alert,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Mock data types
interface BillingInfo {
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  nextBillingDate: string;
  amount: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
}

interface UsageMetrics {
  currentUsers: number;
  userLimit: number;
  storageUsed: number;
  storageLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
}

// Mock data
const mockBillingInfo: BillingInfo = {
  plan: 'Professional Plan',
  status: 'active',
  nextBillingDate: '2024-12-15',
  amount: 99.99,
  currency: 'USD',
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
  {
    id: '2',
    type: 'bank_account',
    last4: '1234',
    isDefault: false,
  },
];

const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    amount: 99.99,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-11-15',
    paidDate: '2024-11-10',
    description: 'Professional Plan - November 2024',
  },
  {
    id: 'INV-2024-002',
    amount: 99.99,
    currency: 'USD',
    status: 'paid',
    dueDate: '2024-10-15',
    paidDate: '2024-10-12',
    description: 'Professional Plan - October 2024',
  },
  {
    id: 'INV-2024-003',
    amount: 99.99,
    currency: 'USD',
    status: 'pending',
    dueDate: '2024-12-15',
    description: 'Professional Plan - December 2024',
  },
];

const mockUsageMetrics: UsageMetrics = {
  currentUsers: 12,
  userLimit: 25,
  storageUsed: 2.5,
  storageLimit: 10,
  apiCallsUsed: 15000,
  apiCallsLimit: 50000,
};

const BillingManagementTab: React.FC = () => {
  const theme = useTheme();
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [isPlanChangeDialogOpen, setIsPlanChangeDialogOpen] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'overdue':
      case 'past_due':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Grid container spacing={3}>
        {/* Subscription Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Current Subscription"
              avatar={<TrendingUpIcon color="primary" />}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {mockBillingInfo.plan}
                  </Typography>
                  <Chip
                    label={mockBillingInfo.status.toUpperCase()}
                    color={getStatusColor(mockBillingInfo.status) as any}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Next billing date
                  </Typography>
                  <Typography variant="h6">
                    {formatDate(mockBillingInfo.nextBillingDate)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(mockBillingInfo.amount, mockBillingInfo.currency)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => setIsPlanChangeDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Change Plan
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Usage Metrics" />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Users</Typography>
                    <Typography variant="body2">
                      {mockUsageMetrics.currentUsers} / {mockUsageMetrics.userLimit}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      backgroundColor: theme.palette.grey[300],
                      borderRadius: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${getUsagePercentage(mockUsageMetrics.currentUsers, mockUsageMetrics.userLimit)}%`,
                        height: '100%',
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Storage (GB)</Typography>
                    <Typography variant="body2">
                      {mockUsageMetrics.storageUsed} / {mockUsageMetrics.storageLimit}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      backgroundColor: theme.palette.grey[300],
                      borderRadius: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${getUsagePercentage(mockUsageMetrics.storageUsed, mockUsageMetrics.storageLimit)}%`,
                        height: '100%',
                        backgroundColor: theme.palette.success.main,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">API Calls</Typography>
                    <Typography variant="body2">
                      {mockUsageMetrics.apiCallsUsed.toLocaleString()} / {mockUsageMetrics.apiCallsLimit.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      backgroundColor: theme.palette.grey[300],
                      borderRadius: 4,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${getUsagePercentage(mockUsageMetrics.apiCallsUsed, mockUsageMetrics.apiCallsLimit)}%`,
                        height: '100%',
                        backgroundColor: theme.palette.warning.main,
                        borderRadius: 4,
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Payment Methods"
              avatar={<CreditCardIcon color="primary" />}
              action={
                <Button
                  size="small"
                  onClick={() => setIsPaymentMethodDialogOpen(true)}
                  startIcon={<EditIcon />}
                >
                  Manage
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {mockPaymentMethods.map((method) => (
                  <Paper key={method.id} variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1">
                          {method.type === 'credit_card' ? method.brand : 'Bank Account'} •••• {method.last4}
                        </Typography>
                        {method.type === 'credit_card' && (
                          <Typography variant="body2" color="text.secondary">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </Typography>
                        )}
                      </Box>
                      {method.isDefault && (
                        <Chip label="Default" size="small" color="primary" />
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Invoices"
              avatar={<ReceiptIcon color="primary" />}
            />
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status.toUpperCase()}
                            color={getStatusColor(invoice.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {invoice.status === 'paid' && invoice.paidDate
                            ? formatDate(invoice.paidDate)
                            : formatDate(invoice.dueDate)}
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

      {/* Payment Method Dialog */}
      <Dialog
        open={isPaymentMethodDialogOpen}
        onClose={() => setIsPaymentMethodDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Payment Methods</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a mock interface. In a real implementation, you would integrate with a payment processor like Stripe.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVC"
                  placeholder="123"
                  margin="normal"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Cardholder Name"
              placeholder="John Doe"
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentMethodDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setIsPaymentMethodDialogOpen(false)}>
            Save Payment Method
          </Button>
        </DialogActions>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog
        open={isPlanChangeDialogOpen}
        onClose={() => setIsPlanChangeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Subscription Plan</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a mock interface. Plan changes would be handled through your billing system.
          </Alert>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Plan</InputLabel>
            <Select
              value="professional"
              label="Select Plan"
            >
              <MenuItem value="basic">Basic Plan - $29.99/month</MenuItem>
              <MenuItem value="professional">Professional Plan - $99.99/month</MenuItem>
              <MenuItem value="enterprise">Enterprise Plan - $299.99/month</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your plan will be updated at the next billing cycle.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPlanChangeDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => setIsPlanChangeDialogOpen(false)}>
            Update Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingManagementTab;