import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from 'notistack';
import { getAnalyticsSummary } from '../analyticsQueries';
import { ANALYTICS_QUERY_KEYS } from '../analyticsQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { AnalyticsFilters } from '../types/analytics';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatusOverview from './InvoiceStatusOverview';
import PaymentDistribution from './PaymentDistribution';

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.GET_ANALYTICS_SUMMARY, filters],
    queryFn: () => getAnalyticsSummary({ filters }),
    staleTime: CACHE_TIMES.DEFAULT,
  });

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'Failed to load analytics data', {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: Date | null) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    const newFilters: AnalyticsFilters = {
      ...filters,
      startDate: dateRange.startDate?.toISOString().split('T')[0],
      endDate: dateRange.endDate?.toISOString().split('T')[0],
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setDateRange({ startDate: null, endDate: null });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: theme.palette.background.default }}>
        <Card
          sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            mb: 3,
          }}>
          <CardHeader
            title={
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Analytics Dashboard
              </Typography>
            }
            subheader={
              <Typography variant="body1" color="text.secondary">
                Comprehensive insights into invoice and tenant performance
              </Typography>
            }
          />
          <CardContent>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.startDate}
                    onChange={(value) => handleDateRangeChange('startDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.endDate}
                    onChange={(value) => handleDateRangeChange('endDate', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    fullWidth
                    sx={{ height: '40px' }}>
                    Apply Filters
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    fullWidth
                    sx={{ height: '40px' }}>
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {analyticsData && (
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <RevenueChart data={analyticsData.revenueMetrics} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <TenantMetrics data={analyticsData.tenantPerformanceMetrics} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <InvoiceStatusOverview data={analyticsData.invoiceStatusMetrics} />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <PaymentDistribution data={analyticsData.paymentDistributionMetrics} />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;