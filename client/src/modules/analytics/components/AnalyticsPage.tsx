import React, { useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';
import { useComprehensiveAnalytics } from '../analyticsQueries';
import { ChartFilters, AnalyticsQueryParams } from '../types/analytics';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';

const AnalyticsPage: React.FC = () => {
  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  // Filter state
  const [filters, setFilters] = useState<ChartFilters>({
    dateRange: {
      startDate: undefined,
      endDate: undefined,
    },
    selectedTenantId: undefined,
  });

  const [tempFilters, setTempFilters] = useState<ChartFilters>(filters);

  // Convert filters to query parameters
  const queryParams = useMemo<AnalyticsQueryParams>(() => {
    const params: AnalyticsQueryParams = {};
    
    if (filters.dateRange.startDate) {
      params.startDate = format(filters.dateRange.startDate, 'yyyy-MM-dd');
    }
    
    if (filters.dateRange.endDate) {
      params.endDate = format(filters.dateRange.endDate, 'yyyy-MM-dd');
    }
    
    if (filters.selectedTenantId) {
      params.tenantId = filters.selectedTenantId;
    }
    
    return params;
  }, [filters]);

  // Fetch data
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useComprehensiveAnalytics(queryParams);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: ChartFilters = {
      dateRange: {
        startDate: undefined,
        endDate: undefined,
      },
      selectedTenantId: undefined,
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load analytics data. Please try again later.
          <br />
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>

        {/* Filters Section */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={tempFilters.dateRange.startDate || null}
                onChange={(date) =>
                  setTempFilters({
                    ...tempFilters,
                    dateRange: {
                      ...tempFilters.dateRange,
                      startDate: date || undefined,
                    },
                  })
                }
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
                value={tempFilters.dateRange.endDate || null}
                onChange={(date) =>
                  setTempFilters({
                    ...tempFilters,
                    dateRange: {
                      ...tempFilters.dateRange,
                      endDate: date || undefined,
                    },
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            
            {isSuperAdmin && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Tenant ID"
                  value={tempFilters.selectedTenantId || ''}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      selectedTenantId: e.target.value || undefined,
                    })
                  }
                  fullWidth
                  size="small"
                  placeholder="Filter by tenant ID"
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  size="small"
                  fullWidth
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  size="small"
                  fullWidth
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading State */}
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Analytics Content */}
        {!isLoading && analyticsData && (
          <Grid container spacing={3}>
            {/* Revenue Chart */}
            <Grid item xs={12} lg={8}>
              <RevenueChart
                data={analyticsData.revenueTrends}
                filters={filters}
                isLoading={isLoading}
              />
            </Grid>

            {/* Invoice Status Overview */}
            <Grid item xs={12} lg={4}>
              <InvoiceStatus
                data={analyticsData.invoiceStatus}
                filters={filters}
                isLoading={isLoading}
              />
            </Grid>

            {/* Tenant Metrics */}
            <Grid item xs={12}>
              <TenantMetrics
                data={analyticsData.tenantMetrics}
                filters={filters}
                isLoading={isLoading}
              />
            </Grid>

            {/* Payment Distribution */}
            <Grid item xs={12}>
              <PaymentDistribution
                data={analyticsData.paymentDistribution}
                filters={filters}
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;