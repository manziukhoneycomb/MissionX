import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAnalytics } from '../analyticsQueries';
import { AnalyticsFilters } from '../types/analytics';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';

const AnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    groupBy: 'month',
  });

  const { data: analyticsData, isLoading, error } = useAnalytics(filters);

  const handleFilterChange = (field: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    handleFilterChange(field, value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load analytics data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="Start Date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              type="date"
              label="End Date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={filters.groupBy || 'month'}
                label="Group By"
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                const start = startOfMonth(new Date());
                const end = endOfMonth(new Date());
                setFilters({
                  startDate: format(start, 'yyyy-MM-dd'),
                  endDate: format(end, 'yyyy-MM-dd'),
                  groupBy: 'month',
                });
              }}
              fullWidth
            >
              Reset Filters
            </Button>
          </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        {analyticsData && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${analyticsData.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Invoices
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.totalInvoices.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Invoice Value
                  </Typography>
                  <Typography variant="h4">
                    ${analyticsData.averageInvoiceValue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Active Tenants
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.tenantMetrics.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        {analyticsData && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <RevenueChart data={analyticsData.revenueMetrics} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <InvoiceStatus data={analyticsData.invoiceStatusMetrics} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <TenantMetrics data={analyticsData.tenantMetrics} />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <PaymentDistribution data={analyticsData.paymentMethodMetrics} />
            </Grid>
          </Grid>
        )}
      </Box>
  );
};

export default AnalyticsPage;