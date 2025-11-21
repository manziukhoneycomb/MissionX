import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPaymentMethod } from '../billingQueries';
import { TENANT_ADMIN_QUERY_KEYS } from '../tenantAdminQueryKeys';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const [paymentType, setPaymentType] = useState<'card' | 'bank_account'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const { mutateAsync: addPaymentMethodMutate, isPending: isAdding } = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_ADMIN_QUERY_KEYS.GET_BILLING_INFO] });
      enqueueSnackbar('Payment method added successfully', { variant: 'success' });
      handleClose();
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to add payment method', { variant: 'error' });
    },
  });

  const handleClose = () => {
    if (!isAdding) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setHolderName('');
      setSetAsDefault(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      // In a real implementation, you would tokenize the payment method
      // using a payment provider's SDK (like Stripe Elements) before sending
      // For now, we'll simulate this with a mock token
      const mockToken = `tok_${Date.now()}`;
      
      await addPaymentMethodMutate({
        type: paymentType,
        token: mockToken,
        setAsDefault,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Payment Method</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Alert severity="info">
            This is a demo interface. In production, this would integrate with a secure payment provider like Stripe.
          </Alert>
          
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Type</FormLabel>
            <RadioGroup
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as 'card' | 'bank_account')}
            >
              <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
              <FormControlLabel value="bank_account" control={<Radio />} label="Bank Account" disabled />
            </RadioGroup>
          </FormControl>

          {paymentType === 'card' && (
            <>
              <TextField
                label="Card Holder Name"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                fullWidth
                disabled={isAdding}
              />
              
              <TextField
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                fullWidth
                disabled={isAdding}
              />
              
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Expiry Date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  disabled={isAdding}
                />
                
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  disabled={isAdding}
                />
              </Stack>
            </>
          )}

          <FormControlLabel
            control={
              <Radio 
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                disabled={isAdding}
              />
            }
            label="Set as default payment method"
          />
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isAdding}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isAdding || !cardNumber || !expiryDate || !cvv}
        >
          {isAdding ? <CircularProgress size={20} /> : 'Add Payment Method'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentMethodDialog;