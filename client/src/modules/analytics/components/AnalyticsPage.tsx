import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Skeleton,
  Paper,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  GetApp as ExportIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAnalyticsData } from '../analyticsQueries';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';
import { analyticsService } from '../services/analyticsService';
import { useAnalyticsFilters } from '../hooks/useAnalyticsFilters';

const AnalyticsPage: React.FC = () => {
  const {
    filters,
    setFilters,
    clearFilters,
    clearTenantFilters,
    clearStatusFilters,
  } = useAnalyticsFilters();

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useAnalyticsData(filters);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      const blob = await analyticsService.exportAnalyticsData(format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load analytics data. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Analytics Dashboard
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('csv')}
            disabled={isLoading}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('xlsx')}
            disabled={isLoading}
          >
            Export Excel
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <DateRangeIcon color="action" />
              <Typography variant="body2" color="text.secondary">
                Active Filters:
              </Typography>
              <Chip
                label={`${filters.dateRange.start} to ${filters.dateRange.end}`}
                color="primary"
                variant="outlined"
                size="small"
              />
              {filters.tenantIds && filters.tenantIds.length > 0 && (
                <Chip
                  label={`${filters.tenantIds.length} tenant(s)`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                  onDelete={clearTenantFilters}
                  deleteIcon={<ClearIcon />}
                />
              )}
              {filters.status && filters.status.length > 0 && (
                <Chip
                  label={`${filters.status.length} status filter(s)`}
                  color="info"
                  variant="outlined"
                  size="small"
                  onDelete={clearStatusFilters}
                  deleteIcon={<ClearIcon />}
                />
              )}
            </Box>
            {(filters.tenantIds || filters.status) && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                color="error"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Revenue Trends</Typography>
              </Box>
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <RevenueChart
                  data={analyticsData?.revenue || []}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Status Overview
              </Typography>
              {isLoading ? (
                <Skeleton variant="rectangular" height={250} />
              ) : (
                <InvoiceStatus
                  data={analyticsData?.invoiceStatus || []}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Distribution
              </Typography>
              {isLoading ? (
                <Skeleton variant="rectangular" height={250} />
              ) : (
                <PaymentDistribution
                  data={analyticsData?.paymentDistribution || []}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tenant Performance Metrics
              </Typography>
              {isLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={300} />
                </Box>
              ) : (
                <TenantMetrics
                  data={analyticsData?.tenantMetrics || []}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsPage;