import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  useTheme,
} from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { ROLES } from '../../../common/constants/roles';
import {
  useAnalyticsOverview,
  useRevenueMetrics,
  useTenantMetrics,
  useInvoiceStatusMetrics,
  usePaymentMetrics,
} from '../analyticsQueries';
import { DateRange } from '../types/analytics';
import MetricSummaryCard from './MetricSummaryCard';
import RevenueChart from './charts/RevenueChart';
import TenantPerformanceChart from './charts/TenantPerformanceChart';
import InvoiceStatusChart from './charts/InvoiceStatusChart';
import PaymentDistributionChart from './charts/PaymentDistributionChart';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ width: '100%' }}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useUser();
  const userRoles = (user?.publicMetadata?.roles as string[]) || [];
  const hasAccess = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const startDate = startOfMonth(subMonths(now, 11));
    const endDate = endOfMonth(now);
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      groupBy: 'month',
    };
  });

  // Queries
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useAnalyticsOverview();
  const { data: revenueMetrics, isLoading: revenueLoading, error: revenueError } = useRevenueMetrics(dateRange);
  const { data: tenantMetrics, isLoading: tenantLoading, error: tenantError } = useTenantMetrics(dateRange);
  const { data: invoiceStatus, isLoading: statusLoading, error: statusError } = useInvoiceStatusMetrics();
  const { data: paymentMetrics, isLoading: paymentLoading, error: paymentError } = usePaymentMetrics(dateRange);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = (field: keyof DateRange, value: any) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = overviewLoading || revenueLoading || tenantLoading || statusLoading || paymentLoading;
  const hasError = overviewError || revenueError || tenantError || statusError || paymentError;

  // Access control
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive insights into invoice and tenant performance
        </Typography>
      </Box>

      {/* Date Range Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Date Range & Filters
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.startDate || ''}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value || undefined)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="End Date"
              type="date"
              value={dateRange.endDate || ''}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value || undefined)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={dateRange.groupBy || 'month'}
                label="Group By"
                onChange={(e) => handleDateRangeChange('groupBy', e.target.value)}
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="quarter">Quarter</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {hasError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load analytics data. Please try again later.
        </Alert>
      )}

      {/* Overview Cards */}
      {overview && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricSummaryCard
              title="Total Revenue"
              metric={overview.totalRevenue}
              format="currency"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricSummaryCard
              title="Total Invoices"
              metric={overview.totalInvoices}
              format="number"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricSummaryCard
              title="Avg Invoice Value"
              metric={overview.avgInvoiceValue}
              format="currency"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricSummaryCard
              title="Payment Success Rate"
              metric={overview.paymentSuccessRate}
              format="percentage"
            />
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
        >
          <Tab label="Revenue Analysis" />
          <Tab label="Customer Performance" />
          <Tab label="Invoice Status" />
          <Tab label="Payment Analytics" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Revenue Trends" />
                <CardContent>
                  {revenueMetrics && (
                    <RevenueChart data={revenueMetrics} height={400} />
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Top Customers" />
                <CardContent>
                  {revenueMetrics?.topCustomers && (
                    <Box>
                      {revenueMetrics.topCustomers.slice(0, 5).map((customer, index) => (
                        <Box
                          key={customer.customerName}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: index < 4 ? 1 : 0,
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">{customer.customerName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {customer.invoiceCount} invoices
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            ${customer.revenue.toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Payment Distribution" />
                <CardContent>
                  {revenueMetrics?.paymentDistribution && (
                    <PaymentDistributionChart
                      data={revenueMetrics.paymentDistribution}
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Customer Performance" />
                <CardContent>
                  {tenantMetrics && (
                    <TenantPerformanceChart data={tenantMetrics} height={400} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Invoice Status Distribution" />
                <CardContent>
                  {invoiceStatus?.statusDistribution && (
                    <InvoiceStatusChart
                      data={invoiceStatus.statusDistribution}
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Invoice Aging Analysis" />
                <CardContent>
                  {invoiceStatus?.agingAnalysis && (
                    <Box>
                      {invoiceStatus.agingAnalysis.map((item, index) => (
                        <Box
                          key={item.ageRange}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: index < invoiceStatus.agingAnalysis.length - 1 ? 1 : 0,
                            borderColor: 'divider',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2">{item.ageRange}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.count} invoices ({item.percentage}%)
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            ${item.totalAmount.toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Payment Method Distribution" />
                <CardContent>
                  {paymentMetrics?.methodDistribution && (
                    <PaymentDistributionChart
                      data={paymentMetrics.methodDistribution}
                      height={300}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Collection Efficiency" />
                <CardContent>
                  {paymentMetrics?.collectionEfficiency && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Collection Rate</Typography>
                        <Typography variant="h6" color="primary">
                          {paymentMetrics.collectionEfficiency.collectionRate}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Total Collected</Typography>
                        <Typography variant="h6">
                          ${paymentMetrics.collectionEfficiency.totalCollected.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Total Outstanding</Typography>
                        <Typography variant="h6" color="warning.main">
                          ${paymentMetrics.collectionEfficiency.totalOutstanding.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Avg Collection Time</Typography>
                        <Typography variant="h6">
                          {paymentMetrics.collectionEfficiency.avgCollectionTime} days
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;