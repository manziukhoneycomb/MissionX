import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Skeleton,
  useTheme,
  Divider,
  CircularProgress,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { BillingInfo, updatePaymentMethod } from '../services/mockBillingService';

interface PaymentMethodCardProps {
  billingInfo?: BillingInfo;
  isLoading: boolean;
}

const paymentMethodSchema = Yup.object().shape({
  cardNumber: Yup.string()
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Enter a valid card number (XXXX XXXX XXXX XXXX)')
    .required('Card number is required'),
  expiryMonth: Yup.number()
    .min(1, 'Invalid month')
    .max(12, 'Invalid month')
    .required('Expiry month is required'),
  expiryYear: Yup.number()
    .min(new Date().getFullYear(), 'Card has expired')
    .max(new Date().getFullYear() + 20, 'Invalid year')
    .required('Expiry year is required'),
  cvv: Yup.string()
    .matches(/^\d{3,4}$/, 'Enter a valid CVV')
    .required('CVV is required'),
});

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ billingInfo, isLoading }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { mutateAsync: updatePaymentMethodMutate, isPending: isUpdatingPayment } = useMutation({
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET_BILLING_INFO'] });
      enqueueSnackbar('Payment method updated successfully!', { variant: 'success' });
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update payment method', { variant: 'error' });
    },
  });

  const handleUpdatePaymentMethod = async (values: any) => {
    const cardNumber = values.cardNumber.replace(/\s/g, '');
    const last4 = cardNumber.slice(-4);
    
    await updatePaymentMethodMutate({
      last4,
      expiryMonth: values.expiryMonth,
      expiryYear: values.expiryYear,
      // In real implementation, you'd tokenize the card with your payment processor
    });
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
          action={<Skeleton variant="circular" width={40} height={40} />}
        />
        <CardContent>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="70%" />
        </CardContent>
      </Card>
    );
  }

  if (!billingInfo) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No payment information available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { paymentMethod, billingAddress } = billingInfo;

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardHeader
          avatar={
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCardIcon />
            </Box>
          }
          title={
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Payment Method
            </Typography>
          }
          subheader="Your billing information"
          action={
            <IconButton 
              onClick={() => setEditDialogOpen(true)}
              sx={{ color: theme.palette.primary.main }}
            >
              <EditIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Card:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  •••• •••• •••• {paymentMethod.last4}
                </Typography>
                {paymentMethod.brand && (
                  <Chip 
                    label={paymentMethod.brand} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Expires:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear}
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Billing Address
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {billingAddress.line1}
          </Typography>
          {billingAddress.line2 && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {billingAddress.line2}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {billingAddress.country}
          </Typography>
        </CardContent>
      </Card>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Update Payment Method</DialogTitle>
        <Formik
          initialValues={{
            cardNumber: '',
            expiryMonth: paymentMethod.expiryMonth || '',
            expiryYear: paymentMethod.expiryYear || '',
            cvv: '',
          }}
          validationSchema={paymentMethodSchema}
          onSubmit={handleUpdatePaymentMethod}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter your new payment information. Your card details are processed securely.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="cardNumber"
                      label="Card Number"
                      fullWidth
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(values.cardNumber)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('cardNumber', formatCardNumber(e.target.value));
                      }}
                      error={touched.cardNumber && !!errors.cardNumber}
                      helperText={touched.cardNumber && errors.cardNumber}
                      inputProps={{ maxLength: 19 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      name="expiryMonth"
                      label="Expiry Month"
                      type="number"
                      fullWidth
                      placeholder="MM"
                      error={touched.expiryMonth && !!errors.expiryMonth}
                      helperText={touched.expiryMonth && errors.expiryMonth}
                      inputProps={{ min: 1, max: 12 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      as={TextField}
                      name="expiryYear"
                      label="Expiry Year"
                      type="number"
                      fullWidth
                      placeholder="YYYY"
                      error={touched.expiryYear && !!errors.expiryYear}
                      helperText={touched.expiryYear && errors.expiryYear}
                      inputProps={{ min: new Date().getFullYear() }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="cvv"
                      label="CVV"
                      type="password"
                      fullWidth
                      placeholder="123"
                      error={touched.cvv && !!errors.cvv}
                      helperText={touched.cvv && errors.cvv}
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUpdatingPayment}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdatingPayment}
                  startIcon={isUpdatingPayment ? <CircularProgress size={16} /> : null}
                >
                  {isUpdatingPayment ? 'Updating...' : 'Update Payment Method'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default PaymentMethodCard;