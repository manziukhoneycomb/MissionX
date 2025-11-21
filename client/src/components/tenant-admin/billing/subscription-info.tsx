import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,
  // useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import { useBilling } from '../../../hooks/use-billing';

const SubscriptionInfo: React.FC = () => {
  // const theme = useTheme();
  const { data: billing, isLoading, error } = useBilling();

  if (isLoading) {
    return (
      <Card>
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
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load subscription information
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const subscription = billing?.data?.subscription;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'canceled':
        return 'error';
      case 'past_due':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'canceled':
        return <WarningIcon />;
      case 'past_due':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'USD'): string => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="h3">
            Subscription Details
          </Typography>
        }
        action={
          subscription?.status && (
            <Chip
              icon={getStatusIcon(subscription.status)}
              label={subscription.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(subscription.status) as any}
              size="small"
            />
          )
        }
      />
      <CardContent>
        {!subscription ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No active subscription found.
            <Button
              variant="outlined"
              size="small"
              startIcon={<UpgradeIcon />}
              sx={{ ml: 2 }}>
              Start Subscription
            </Button>
          </Alert>
        ) : (
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Plan"
                secondary={subscription.planName || 'Unknown Plan'}
              />
            </ListItem>
            
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Billing Amount"
                secondary={`${formatCurrency(subscription.amount, subscription.currency)} / ${subscription.interval || 'month'}`}
              />
            </ListItem>
            
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Current Period"
                secondary={`${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`}
              />
            </ListItem>
            
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                <InfoIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Next Billing Date"
                secondary={formatDate(subscription.nextBillingDate)}
              />
            </ListItem>
          </List>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UpgradeIcon />}
            disabled={!subscription}>
            Manage Subscription
          </Button>
          {subscription && (
            <Button
              variant="text"
              size="small"
              color="error">
              Cancel Subscription
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;