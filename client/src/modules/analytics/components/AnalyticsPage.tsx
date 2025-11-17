import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { useAnalyticsOverview } from '../analyticsQueries';
import { AnalyticsQueryDto } from '../types/analytics';
import { AnalyticsProvider, useAnalyticsContext } from '../context/AnalyticsContext';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';

const AnalyticsPageContent: React.FC = () => {
  const { exportData, setGlobalQuery } = useAnalyticsContext();
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    endDate: new Date(), // Today
  });
  
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [limit, setLimit] = useState<number>(10);

  const query: AnalyticsQueryDto = useMemo(() => ({
    startDate: dateRange.startDate?.toISOString().split('T')[0],
    endDate: dateRange.endDate?.toISOString().split('T')[0],
    period,
    limit,
  }), [dateRange, period, limit]);

  const { data: analyticsData, isLoading, error, refetch } = useAnalyticsOverview(query);

  // Update global query when local query changes
  React.useEffect(() => {
    setGlobalQuery(query);
  }, [query, setGlobalQuery]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setPeriod(event.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly');
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (analyticsData) {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics-dashboard-${timestamp}`;
      exportData(analyticsData, filename, 'json');
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load analytics data. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor financial and tenant activity insights
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={isLoading || !analyticsData}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : null 
                }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : null 
                }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select value={period} onChange={handlePeriodChange} label="Period">
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Top Results Limit</InputLabel>
                <Select value={limit} onChange={handleLimitChange} label="Top Results Limit">
                  <MenuItem value={5}>Top 5</MenuItem>
                  <MenuItem value={10}>Top 10</MenuItem>
                  <MenuItem value={20}>Top 20</MenuItem>
                  <MenuItem value={50}>Top 50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {analyticsData && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Date Range: ${analyticsData.dateRange.startDate} to ${analyticsData.dateRange.endDate}`}
                variant="outlined" 
              />
              <Chip label={`Period: ${period}`} variant="outlined" />
              <Chip label={`Limit: ${limit}`} variant="outlined" />
            </Box>
          )}
        </Paper>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Analytics Content */}
        {analyticsData && !isLoading && (
          <Grid container spacing={4}>
            {/* Revenue Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Revenue Trends
                </Typography>
                <RevenueChart data={analyticsData.revenueTrends} query={query} />
              </Paper>
            </Grid>

            {/* Tenant Metrics */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Tenant Performance
                </Typography>
                <TenantMetrics data={analyticsData.tenantMetrics} query={query} />
              </Paper>
            </Grid>

            {/* Invoice Status */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Invoice Status Overview
                </Typography>
                <InvoiceStatus data={analyticsData.invoiceStatus} query={query} />
              </Paper>
            </Grid>

            {/* Payment Distribution */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Payment Distribution
                </Typography>
                <PaymentDistribution data={analyticsData.paymentDistribution} query={query} />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
  );
};

const AnalyticsPage: React.FC = () => {
  return (
    <AnalyticsProvider>
      <AnalyticsPageContent />
    </AnalyticsProvider>
  );
};

export default AnalyticsPage;