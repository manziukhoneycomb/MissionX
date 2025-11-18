import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { getAnalytics } from '../analyticsQueries';
import { ANALYTICS_QUERY_KEYS } from '../analyticsQueryKeys';
import { AnalyticsQueryParams } from '../types/analytics';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import RevenueChart from './RevenueChart';
import PaymentDistributionChart from './PaymentDistributionChart';
import TenantPerformanceChart from './TenantPerformanceChart';
import InvoiceStatusOverview from './InvoiceStatusOverview';
import TopCustomersChart from './TopCustomersChart';
import AgingAnalysisChart from './AgingAnalysisChart';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: format(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 1 year ago
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [filters, setFilters] = useState<AnalyticsQueryParams>({});

  const queryParams: AnalyticsQueryParams = {
    ...filters,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.GET_ANALYTICS, queryParams],
    queryFn: () => getAnalytics(queryParams),
    staleTime: CACHE_TIMES.DEFAULT,
  });

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'Failed to load analytics data', {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const handleApplyFilters = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
          <CardHeader
            title={
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Analytics Dashboard
              </Typography>
            }
          />
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                label="Start Date"
                type="date"
                size="small"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button variant="contained" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Revenue Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  ${analyticsData?.revenueMetrics.totalRevenue.toLocaleString() || '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Invoices
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.invoiceStatusOverview.total.toLocaleString() || '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Paid Invoices
                </Typography>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.invoiceStatusOverview.paid.toLocaleString() || '0'}
                  <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                    ({analyticsData?.invoiceStatusOverview.paidPercentage.toFixed(1) || '0'}%)
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Overdue Invoices
                </Typography>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {analyticsData?.invoiceStatusOverview.overdue.toLocaleString() || '0'}
                  <Typography variant="body2" component="span" color="text.secondary" sx={{ ml: 1 }}>
                    ({analyticsData?.invoiceStatusOverview.overduePercentage.toFixed(1) || '0'}%)
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Revenue Trends" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <RevenueChart data={analyticsData?.revenueMetrics} />
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Distribution */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Payment Distribution" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <PaymentDistributionChart data={analyticsData?.paymentDistribution} />
              </CardContent>
            </Card>
          </Grid>

          {/* Top Customers */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Top Customers" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <TopCustomersChart data={analyticsData?.topCustomers} />
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Status Overview */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Invoice Status Overview" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <InvoiceStatusOverview data={analyticsData?.invoiceStatusOverview} />
              </CardContent>
            </Card>
          </Grid>

          {/* Tenant Performance */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Tenant Performance" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <TenantPerformanceChart data={analyticsData?.tenantPerformance} />
              </CardContent>
            </Card>
          </Grid>

          {/* Aging Analysis */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, height: '400px' }}>
              <CardHeader title="Invoice Aging Analysis" />
              <CardContent sx={{ height: 'calc(100% - 64px)' }}>
                <AgingAnalysisChart data={analyticsData?.agingAnalysis} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default AnalyticsPage;