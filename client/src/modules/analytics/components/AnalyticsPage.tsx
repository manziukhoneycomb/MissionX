import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useAnalyticsData } from '../analyticsQueries';
import { AnalyticsFilters } from '../types/analytics';
import SimpleRevenueChart from './SimpleRevenueChart';
import SimpleTenantMetrics from './SimpleTenantMetrics';
import SimpleInvoiceStatus from './SimpleInvoiceStatus';
import SimplePaymentDistribution from './SimplePaymentDistribution';
import { analyticsService } from '../services/analyticsService';

const AnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useAnalyticsData(filters);

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

  const handleExport = async (type: 'revenue' | 'tenants' | 'invoices' | 'payments') => {
    try {
      const blob = await analyticsService.exportData(type, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load analytics data. Please try again.
      </Alert>
    );
  }

  return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('revenue')}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateRange?.startDate || ''}
                  onChange={(e) => {
                    handleFilterChange({
                      dateRange: {
                        ...filters.dateRange,
                        startDate: e.target.value,
                        endDate: filters.dateRange?.endDate || format(new Date(), 'yyyy-MM-dd'),
                      },
                    });
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.dateRange?.endDate || ''}
                  onChange={(e) => {
                    handleFilterChange({
                      dateRange: {
                        startDate: filters.dateRange?.startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                        ...filters.dateRange,
                        endDate: e.target.value,
                      },
                    });
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tenant ID"
                  value={filters.tenantId || ''}
                  onChange={(e) => handleFilterChange({ tenantId: e.target.value || undefined })}
                />
              </Box>
              <Box sx={{ minWidth: 200 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer ID"
                  value={filters.customerId || ''}
                  onChange={(e) => handleFilterChange({ customerId: e.target.value || undefined })}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Charts Layout */}
        {analyticsData && (
          <Box>
            {/* Top Row */}
            <Box display="flex" gap={3} mb={3} flexWrap="wrap">
              {/* Revenue Charts */}
              <Box sx={{ flex: '2 1 600px', minWidth: 0 }}>
                <SimpleRevenueChart
                  data={analyticsData.revenueMetrics}
                  onExport={() => handleExport('revenue')}
                  key={`revenue-${refreshKey}`}
                />
              </Box>

              {/* Status and Payment Side by Side */}
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <Box display="flex" flexDirection="column" gap={3} height="100%">
                  {/* Invoice Status Overview */}
                  <SimpleInvoiceStatus
                    data={analyticsData.invoiceStatusOverview}
                    onExport={() => handleExport('invoices')}
                    key={`status-${refreshKey}`}
                  />

                  {/* Payment Distribution */}
                  <SimplePaymentDistribution
                    data={analyticsData.paymentDistribution}
                    onExport={() => handleExport('payments')}
                    key={`payments-${refreshKey}`}
                  />
                </Box>
              </Box>
            </Box>

            {/* Bottom Row - Tenant Metrics */}
            <SimpleTenantMetrics
              data={analyticsData.tenantPerformance}
              onExport={() => handleExport('tenants')}
              key={`tenants-${refreshKey}`}
            />
          </Box>
        )}
      </Box>
  );
};

export default AnalyticsPage;