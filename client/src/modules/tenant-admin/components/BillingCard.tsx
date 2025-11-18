import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingInfo, mockBillingService } from '../services/mockBillingService';

interface BillingCardProps {
  billingInfo: BillingInfo;
}

const BillingCard: React.FC<BillingCardProps> = ({ billingInfo }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: billingInfo.paymentMethod.type,
    last4: billingInfo.paymentMethod.last4,
    brand: billingInfo.paymentMethod.brand || '',
    expiryMonth: billingInfo.paymentMethod.expiryMonth || 1,
    expiryYear: billingInfo.paymentMethod.expiryYear || new Date().getFullYear(),
  });

  const { mutateAsync: updatePaymentMethodMutate, isPending: isUpdatingPayment } = useMutation({
    mutationFn: mockBillingService.updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-info'] });
      enqueueSnackbar('Payment method updated successfully', { variant: 'success' });
      setIsEditPaymentDialogOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update payment method', { variant: 'error' });
    },
  });

  const getStatusColor = (status: string) => {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleUpdatePaymentMethod = async () => {
    await updatePaymentMethodMutate({
      type: newPaymentMethod.type as 'card' | 'bank',
      last4: newPaymentMethod.last4,
      brand: newPaymentMethod.brand,
      expiryMonth: newPaymentMethod.expiryMonth,
      expiryYear: newPaymentMethod.expiryYear,
    });
  };

  const renderPaymentMethodIcon = () => {
    return billingInfo.paymentMethod.type === 'card' ? <CreditCardIcon /> : <AccountBalanceIcon />;
  };

  const renderPaymentMethodDetails = () => {
    const { paymentMethod } = billingInfo;
    if (paymentMethod.type === 'card') {
      return (
        <Typography variant="body2" color="text.secondary">
          {paymentMethod.brand} •••• {paymentMethod.last4}
          {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
            <> • Expires {paymentMethod.expiryMonth.toString().padStart(2, '0')}/{paymentMethod.expiryYear}</>
          )}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" color="text.secondary">
        Bank Account •••• {paymentMethod.last4}
      </Typography>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Payment Method
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => setIsEditPaymentDialogOpen(true)}
          >
            Edit
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          {renderPaymentMethodIcon()}
          <Box>
            <Typography variant="body1">
              {billingInfo.paymentMethod.type === 'card' ? 'Credit Card' : 'Bank Account'}
            </Typography>
            {renderPaymentMethodDetails()}
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
          Recent Billing History
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingInfo.billingHistory.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{formatDate(bill.date)}</TableCell>
                  <TableCell>{bill.description}</TableCell>
                  <TableCell>{formatCurrency(bill.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      color={getStatusColor(bill.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog
        open={isEditPaymentDialogOpen}
        onClose={() => setIsEditPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Method</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Payment Type"
              value={newPaymentMethod.type}
              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value as 'card' | 'bank' }))}
              fullWidth
            >
              <MenuItem value="card">Credit Card</MenuItem>
              <MenuItem value="bank">Bank Account</MenuItem>
            </TextField>
            
            {newPaymentMethod.type === 'card' && (
              <>
                <TextField
                  label="Card Brand"
                  value={newPaymentMethod.brand}
                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, brand: e.target.value }))}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    select
                    label="Expiry Month"
                    value={newPaymentMethod.expiryMonth}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: Number(e.target.value) }))}
                    sx={{ flexBasis: '50%' }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <MenuItem key={month} value={month}>
                        {month.toString().padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Expiry Year"
                    value={newPaymentMethod.expiryYear}
                    onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: Number(e.target.value) }))}
                    sx={{ flexBasis: '50%' }}
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </>
            )}
            
            <TextField
              label="Last 4 Digits"
              value={newPaymentMethod.last4}
              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, last4: e.target.value }))}
              fullWidth
              inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditPaymentDialogOpen(false)} disabled={isUpdatingPayment}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdatePaymentMethod}
            disabled={isUpdatingPayment}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingCard;