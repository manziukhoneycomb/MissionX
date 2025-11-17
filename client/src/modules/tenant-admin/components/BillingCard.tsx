import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Skeleton,
  useTheme,
  Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { BillingInfo } from '../services/mockBillingService';

interface BillingCardProps {
  billingInfo?: BillingInfo;
  isLoading: boolean;
}

const BillingCard: React.FC<BillingCardProps> = ({ billingInfo, isLoading }) => {
  const theme = useTheme();

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
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
            No billing information available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
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
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceWalletIcon />
          </Box>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Current Plan
          </Typography>
        }
        subheader="Your active subscription"
      />
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              {billingInfo.currentPlan.name}
            </Typography>
            {billingInfo.currentPlan.isPopular && (
              <Chip 
                label="Popular" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {billingInfo.currentPlan.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Monthly Price:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${billingInfo.currentPlan.price}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Next Billing Date:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {formatDate(billingInfo.nextBillingDate)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Billing Email:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {billingInfo.billingEmail}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BillingCard;