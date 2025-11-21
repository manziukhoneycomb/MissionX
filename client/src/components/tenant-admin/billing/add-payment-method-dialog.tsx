import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { usePaymentMethods } from '../../../hooks/use-payment-methods';

interface AddPaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onPaymentMethodAdded: () => void;
}

interface PaymentMethodFormValues {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardholderName: string;
  billingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const validationSchema = yup.object({
  cardNumber: yup
    .string()
    .matches(/^\d{13,19}$/, 'Card number must be 13-19 digits')
    .required('Card number is required'),
  expMonth: yup
    .string()
    .matches(/^(0[1-9]|1[0-2])$/, 'Enter valid month (01-12)')
    .required('Expiry month is required'),
  expYear: yup
    .string()
    .matches(/^\d{2}$/, 'Enter valid year (YY)')
    .required('Expiry year is required'),
  cvc: yup
    .string()
    .matches(/^\d{3,4}$/, 'CVC must be 3-4 digits')
    .required('CVC is required'),
  cardholderName: yup
    .string()
    .required('Cardholder name is required'),
  billingAddress: yup.object({
    line1: yup.string().required('Address line 1 is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    postalCode: yup.string().required('Postal code is required'),
    country: yup.string().required('Country is required'),
  }),
});

const AddPaymentMethodDialog: React.FC<AddPaymentMethodDialogProps> = ({
  open,
  onClose,
  onPaymentMethodAdded,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { addPaymentMethod } = usePaymentMethods();

  const { mutate: addPaymentMethodMutate, isPending } = useMutation({
    mutationFn: addPaymentMethod.mutateAsync,
    onSuccess: () => {
      enqueueSnackbar('Payment method added successfully', { variant: 'success' });
      onPaymentMethodAdded();
      formik.resetForm();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add payment method', { variant: 'error' });
    },
  });

  const formik = useFormik<PaymentMethodFormValues>({
    initialValues: {
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvc: '',
      cardholderName: '',
      billingAddress: {
        line1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      },
    },
    validationSchema,
    onSubmit: (values) => {
      const paymentMethodData = {
        type: 'card' as const,
        card: {
          number: values.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(values.expMonth, 10),
          exp_year: parseInt(`20${values.expYear}`, 10),
          cvc: values.cvc,
        },
        billing_details: {
          name: values.cardholderName,
          address: values.billingAddress,
        },
      };
      addPaymentMethodMutate(paymentMethodData);
    },
  });

  const handleClose = () => {
    if (!isPending) {
      formik.resetForm();
      onClose();
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .substring(0, 23);
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(event.target.value);
    formik.setFieldValue('cardNumber', formatted.replace(/\s/g, ''));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        Add Payment Method
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography variant="subtitle2" gutterBottom>
            Card Information
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Card Number"
              value={formatCardNumber(formik.values.cardNumber)}
              onChange={handleCardNumberChange}
              onBlur={formik.handleBlur}
              name="cardNumber"
              error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
              helperText={formik.touched.cardNumber && formik.errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              inputProps={{ maxLength: 23 }}
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="MM"
                name="expMonth"
                value={formik.values.expMonth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expMonth && Boolean(formik.errors.expMonth)}
                helperText={formik.touched.expMonth && formik.errors.expMonth}
                placeholder="12"
                inputProps={{ maxLength: 2 }}
                sx={{ flexBasis: '33%' }}
              />
              <TextField
                label="YY"
                name="expYear"
                value={formik.values.expYear}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expYear && Boolean(formik.errors.expYear)}
                helperText={formik.touched.expYear && formik.errors.expYear}
                placeholder="25"
                inputProps={{ maxLength: 2 }}
                sx={{ flexBasis: '33%' }}
              />
              <TextField
                label="CVC"
                name="cvc"
                value={formik.values.cvc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cvc && Boolean(formik.errors.cvc)}
                helperText={formik.touched.cvc && formik.errors.cvc}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
                sx={{ flexBasis: '33%' }}
              />
            </Stack>
            
            <TextField
              fullWidth
              label="Cardholder Name"
              name="cardholderName"
              value={formik.values.cardholderName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.cardholderName && Boolean(formik.errors.cardholderName)}
              helperText={formik.touched.cardholderName && formik.errors.cardholderName}
            />
          </Stack>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
            Billing Address
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Address Line 1"
              name="billingAddress.line1"
              value={formik.values.billingAddress.line1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.line1 && Boolean(formik.errors.billingAddress?.line1)}
              helperText={formik.touched.billingAddress?.line1 && formik.errors.billingAddress?.line1}
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="City"
                name="billingAddress.city"
                value={formik.values.billingAddress.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.billingAddress?.city && Boolean(formik.errors.billingAddress?.city)}
                helperText={formik.touched.billingAddress?.city && formik.errors.billingAddress?.city}
              />
              <TextField
                fullWidth
                label="State"
                name="billingAddress.state"
                value={formik.values.billingAddress.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.billingAddress?.state && Boolean(formik.errors.billingAddress?.state)}
                helperText={formik.touched.billingAddress?.state && formik.errors.billingAddress?.state}
              />
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Postal Code"
                name="billingAddress.postalCode"
                value={formik.values.billingAddress.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.billingAddress?.postalCode && Boolean(formik.errors.billingAddress?.postalCode)}
                helperText={formik.touched.billingAddress?.postalCode && formik.errors.billingAddress?.postalCode}
              />
              <TextField
                fullWidth
                label="Country"
                name="billingAddress.country"
                value={formik.values.billingAddress.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.billingAddress?.country && Boolean(formik.errors.billingAddress?.country)}
                helperText={formik.touched.billingAddress?.country && formik.errors.billingAddress?.country}
              />
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}>
          {isPending ? 'Adding...' : 'Add Payment Method'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentMethodDialog;