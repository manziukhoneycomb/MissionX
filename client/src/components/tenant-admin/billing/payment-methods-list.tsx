import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { usePaymentMethods } from '../../../hooks/use-payment-methods';
import AddPaymentMethodDialog from './add-payment-method-dialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  billingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

const PaymentMethodsList: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);

  const { data: paymentMethods, isLoading, error } = usePaymentMethods();
  const { deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();

  const { mutate: deletePaymentMethodMutate, isPending: isDeleting } = useMutation({
    mutationFn: deletePaymentMethod.mutateAsync,
    onSuccess: () => {
      enqueueSnackbar('Payment method deleted successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      setDeleteConfirmOpen(false);
      setPaymentMethodToDelete(null);
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete payment method', { variant: 'error' });
    },
  });

  const { mutate: setDefaultMutate, isPending: isSettingDefault } = useMutation({
    mutationFn: setDefaultPaymentMethod.mutateAsync,
    onSuccess: () => {
      enqueueSnackbar('Default payment method updated', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update default payment method', { variant: 'error' });
    },
  });

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    setPaymentMethodToDelete(paymentMethod);
    setDeleteConfirmOpen(true);
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setDefaultMutate(paymentMethodId);
  };

  const handleConfirmDelete = () => {
    if (paymentMethodToDelete) {
      deletePaymentMethodMutate(paymentMethodToDelete.id);
    }
  };

  const formatExpiryDate = (month: number, year: number): string => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const getCardIcon = (_brand: string) => {
    return <CreditCardIcon />;
  };

  const formatBillingAddress = (address: PaymentMethod['billingAddress']): string => {
    if (!address) return '';
    const parts = [address.city, address.state, address.postalCode].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Alert severity="error">
            Failed to load payment methods
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const methods: PaymentMethod[] = paymentMethods?.data || [];

  return (
    <>
      <Card sx={{ height: 'fit-content' }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h3">
              Payment Methods
            </Typography>
          }
          action={
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}>
              Add Card
            </Button>
          }
        />
        <CardContent>
          {methods.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No payment methods found.
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                sx={{ ml: 2 }}
                onClick={() => setAddDialogOpen(true)}>
                Add Payment Method
              </Button>
            </Alert>
          ) : (
            <List disablePadding>
              {methods.map((method) => (
                <ListItem key={method.id} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {getCardIcon(method.brand)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </Typography>
                        {method.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          Expires {formatExpiryDate(method.expMonth, method.expYear)}
                        </Typography>
                        {method.billingAddress && (
                          <Typography variant="caption" color="text.secondary">
                            {formatBillingAddress(method.billingAddress)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {!method.isDefault && (
                        <Tooltip title="Set as default">
                          <IconButton
                            size="small"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={isSettingDefault}>
                            <StarBorderIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {method.isDefault && (
                        <Tooltip title="Default payment method">
                          <IconButton size="small" disabled>
                            <StarIcon color="primary" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete payment method">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePaymentMethod(method)}
                          disabled={isDeleting && paymentMethodToDelete?.id === method.id}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onPaymentMethodAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
          setAddDialogOpen(false);
        }}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPaymentMethodToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Payment Method"
        message={`Are you sure you want to delete the payment method ending in ${paymentMethodToDelete?.last4}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />
    </>
  );
};

export default PaymentMethodsList;