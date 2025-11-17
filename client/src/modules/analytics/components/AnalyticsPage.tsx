import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import AnalyticsFilters from './AnalyticsFilters';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatus from './InvoiceStatus';
import PaymentDistribution from './PaymentDistribution';
import AnalyticsSummaryCards from './AnalyticsSummaryCards';

const AnalyticsPage: React.FC = () => {
  return (
    <AnalyticsProvider>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor financial and tenant activity insights with interactive visualizations
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <AnalyticsFilters />
        </Paper>

        {/* Summary Cards */}
        <Box sx={{ mb: 4 }}>
          <AnalyticsSummaryCards />
        </Box>

        {/* Main Charts Grid */}
        <Grid container spacing={4}>
          {/* Revenue Trends - Full width */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Revenue Trends
                </Typography>
                <RevenueChart />
              </CardContent>
            </Card>
          </Grid>

          {/* Tenant Metrics - Half width */}
          <Grid item xs={12} lg={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Tenant Performance
                </Typography>
                <TenantMetrics />
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Status - Half width */}
          <Grid item xs={12} lg={6}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  Invoice Status Overview
                </Typography>
                <InvoiceStatus />
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Distribution - Full width */}
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  Payment Distribution Analysis
                </Typography>
                <PaymentDistribution />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AnalyticsProvider>
  );
};

export default AnalyticsPage;