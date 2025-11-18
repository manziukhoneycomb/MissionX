import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { format, subMonths } from 'date-fns';
import { 
  useRevenueAnalytics, 
  useTenantAnalytics, 
  useInvoiceStatusAnalytics, 
  usePaymentDistributionAnalytics 
} from './analyticsQueries';
import { AnalyticsDateRange } from './types/analytics';
import RevenueChart from './components/RevenueChart';
import TenantMetrics from './components/TenantMetrics';
import InvoiceStatusOverview from './components/InvoiceStatusOverview';
import PaymentDistribution from './components/PaymentDistribution';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>({
    startDate: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 12));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueAnalytics(dateRange);

  const {
    data: tenantData,
    isLoading: tenantLoading,
    error: tenantError,
  } = useTenantAnalytics(dateRange);

  const {
    data: invoiceStatusData,
    isLoading: invoiceStatusLoading,
    error: invoiceStatusError,
  } = useInvoiceStatusAnalytics(dateRange);

  const {
    data: paymentData,
    isLoading: paymentLoading,
    error: paymentError,
  } = usePaymentDistributionAnalytics(dateRange);

  const handleDateRangeUpdate = () => {
    if (startDate && endDate) {
      setDateRange({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
    }
  };

  const hasErrors = revenueError || tenantError || invoiceStatusError || paymentError;
  const isLoading = revenueLoading || tenantLoading || invoiceStatusLoading || paymentLoading;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Monitor key metrics related to invoices, tenants, and financial performance
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Date Range Filter
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Start Date"
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
              <Button 
                variant="contained" 
                onClick={handleDateRangeUpdate}
                disabled={!startDate || !endDate}
                size="small"
              >
                Apply Filter
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {hasErrors && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading analytics data. Please try refreshing the page.
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <RevenueChart data={revenueData} />
          </Grid>

          <Grid item xs={12} lg={6}>
            <InvoiceStatusOverview data={invoiceStatusData} />
          </Grid>

          <Grid item xs={12} lg={6}>
            <TenantMetrics data={tenantData} />
          </Grid>

          <Grid item xs={12} lg={6}>
            <PaymentDistribution data={paymentData} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AnalyticsPage;