import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  People,
  Assessment,
} from '@mui/icons-material';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import {
  useRevenueTrends,
  useTenantPerformance,
  useInvoiceStatusOverview,
} from '../analyticsQueries';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactElement;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  isLoading?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  isLoading = false,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('amount')) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      }
      return val.toLocaleString();
    }
    return val.toString();
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="h3" color="text.secondary">
            {title}
          </Typography>
        </Box>

        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            <Typography variant="h4" component="p" fontWeight="bold" sx={{ mb: 1 }}>
              {formatValue(value)}
            </Typography>
            
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {change >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Chip
                  label={`${change >= 0 ? '+' : ''}${change.toFixed(1)}%`}
                  size="small"
                  color={change >= 0 ? 'success' : 'error'}
                  variant="outlined"
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const AnalyticsSummaryCards: React.FC = () => {
  const { filter } = useAnalyticsFilter();
  
  const query = {
    dateRange: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    tenantIds: filter.selectedTenants.length > 0 ? filter.selectedTenants : undefined,
  };

  const { data: revenueData, isLoading: isRevenueLoading, error: revenueError } = 
    useRevenueTrends(query);
  
  const { data: tenantData, isLoading: isTenantLoading, error: tenantError } = 
    useTenantPerformance(query);
  
  const { data: statusData, isLoading: isStatusLoading, error: statusError } = 
    useInvoiceStatusOverview(query);

  if (revenueError || tenantError || statusError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Failed to load summary data. Please try again.
      </Alert>
    );
  }

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: revenueData?.totalRevenue || 0,
      icon: <AttachMoney />,
      color: 'primary' as const,
      isLoading: isRevenueLoading,
    },
    {
      title: 'Total Invoices',
      value: revenueData?.totalInvoices || 0,
      icon: <Receipt />,
      color: 'secondary' as const,
      isLoading: isRevenueLoading,
    },
    {
      title: 'Active Tenants',
      value: tenantData?.tenants.length || 0,
      icon: <People />,
      color: 'info' as const,
      isLoading: isTenantLoading,
    },
    {
      title: 'Collection Rate',
      value: `${statusData?.collectionRate.toFixed(1) || 0}%`,
      icon: <Assessment />,
      color: (statusData?.collectionRate || 0) >= 80 ? 'success' as const : 'warning' as const,
      isLoading: isStatusLoading,
    },
  ];

  return (
    <Grid container spacing={3}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default AnalyticsSummaryCards;