import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  PaymentIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import useUserRoles from '../../common/hooks/useUserRoles';
import { ROLES } from '../../common/constants/roles';
import { useAnalyticsSummary } from './analyticsQueries';
import RevenueChart from './components/RevenueChart';
import TenantMetrics from './components/TenantMetrics';
import InvoiceStatus from './components/InvoiceStatus';
import PaymentDistribution from './components/PaymentDistribution';
import { DateRangeFilter } from './services/analyticsService';

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});
  const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const userRoles = useUserRoles();
  
  // Check if user has required role access
  const hasAccess = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useAnalyticsSummary(dateRange);

  const handleStartDateChange = (date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      startDate: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    setDateRange(prev => ({
      ...prev,
      endDate: date ? format(date, 'yyyy-MM-dd') : undefined,
    }));
  };

  const handleExport = async (type: 'revenue' | 'tenants' | 'status' | 'payments') => {
    try {
      // This would implement the actual export functionality
      console.log(`Exporting ${type} data...`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!hasAccess) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to access the Analytics page. Please contact your administrator.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ mt: 2, mb: 2, maxWidth: '1400px', px: { xs: 2, sm: 3 } }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('revenue')}
              size="small"
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {/* Date Range Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Filters:
            </Typography>
            
            <DatePicker
              label="Start Date"
              value={dateRange.startDate ? new Date(dateRange.startDate) : null}
              onChange={handleStartDateChange}
              slotProps={{ textField: { size: 'small' } }}
            />
            
            <DatePicker
              label="End Date"
              value={dateRange.endDate ? new Date(dateRange.endDate) : null}
              onChange={handleEndDateChange}
              slotProps={{ textField: { size: 'small' } }}
            />

            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={period === 'monthly' ? 'contained' : 'outlined'}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={period === 'quarterly' ? 'contained' : 'outlined'}
                onClick={() => setPeriod('quarterly')}
              >
                Quarterly
              </Button>
            </ButtonGroup>
          </Box>
        </Paper>

        {/* Summary Cards */}
        {summaryLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {summaryError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load analytics data. Please try again later.
          </Alert>
        )}

        {summaryData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Revenue
                      </Typography>
                      <Typography variant="h4">
                        ${summaryData.data.totalRevenue.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon color="secondary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Invoices
                      </Typography>
                      <Typography variant="h4">
                        {summaryData.data.totalInvoices.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Avg Invoice Value
                      </Typography>
                      <Typography variant="h4">
                        ${summaryData.data.averageInvoiceValue.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PaymentIcon color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Payment Timeliness
                      </Typography>
                      <Typography variant="h4">
                        {summaryData.data.paymentTimeliness}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader 
                title="Revenue Trends" 
                subheader={`${period === 'monthly' ? 'Monthly' : 'Quarterly'} revenue overview`}
              />
              <CardContent>
                <RevenueChart period={period} filters={dateRange} />
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Status */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader 
                title="Invoice Status" 
                subheader="Current invoice distribution"
              />
              <CardContent>
                <InvoiceStatus filters={dateRange} />
              </CardContent>
            </Card>
          </Grid>

          {/* Tenant Metrics */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader 
                title="Top Tenants" 
                subheader="Performance by tenant"
              />
              <CardContent>
                <TenantMetrics filters={dateRange} />
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Distribution */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader 
                title="Payment Methods" 
                subheader="Payment distribution analysis"
              />
              <CardContent>
                <PaymentDistribution filters={dateRange} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsPage;