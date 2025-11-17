import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  TextField,
} from '@mui/material';
import { format, subMonths } from 'date-fns';
import { 
  useAnalyticsData, 
  useRevenueData, 
  useTenantMetrics, 
  useInvoiceStatusData, 
  usePaymentDistribution 
} from './analyticsQueries';
import RevenueChart from './components/RevenueChart';
import TenantMetrics from './components/TenantMetrics';
import InvoiceStatus from './components/InvoiceStatus';
import PaymentDistribution from './components/PaymentDistribution';

interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  period: 'monthly' | 'quarterly';
}

const AnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: subMonths(new Date(), 12),
    endDate: new Date(),
    period: 'monthly',
  });

  const startDateStr = format(filters.startDate, 'yyyy-MM-dd');
  const endDateStr = format(filters.endDate, 'yyyy-MM-dd');

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAnalyticsData(startDateStr, endDateStr);

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueData(filters.period, startDateStr, endDateStr);

  const {
    data: tenantData,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenantMetrics('revenue', 'desc');

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useInvoiceStatusData();

  const {
    data: paymentData,
    isLoading: paymentLoading,
    error: paymentError,
  } = usePaymentDistribution(filters.period);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setFilters(prev => ({
      ...prev,
      period: event.target.value as 'monthly' | 'quarterly',
    }));
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    if (!isNaN(date.getTime())) {
      setFilters(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    if (!isNaN(date.getTime())) {
      setFilters(prev => ({ ...prev, endDate: date }));
    }
  };

  const resetFilters = () => {
    setFilters({
      startDate: subMonths(new Date(), 12),
      endDate: new Date(),
      period: 'monthly',
    });
  };

  const isLoading = analyticsLoading || revenueLoading || tenantLoading || statusLoading || paymentLoading;
  const hasError = analyticsError || revenueError || tenantError || statusError || paymentError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load analytics data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={format(filters.startDate, 'yyyy-MM-dd')}
                onChange={handleStartDateChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={format(filters.endDate, 'yyyy-MM-dd')}
                onChange={handleEndDateChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={filters.period}
                  label="Period"
                  onChange={handlePeriodChange}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="outlined" onClick={resetFilters} fullWidth>
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trends
                </Typography>
                <RevenueChart data={revenueData || []} period={filters.period} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Invoice Status Overview
                </Typography>
                <InvoiceStatus data={statusData} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tenant Performance
                </Typography>
                <TenantMetrics data={tenantData || []} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Distribution
                </Typography>
                <PaymentDistribution data={paymentData || []} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  );
};

export default AnalyticsPage;