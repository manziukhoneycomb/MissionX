import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
} from 'victory';
import { TenantMetricsDto, AnalyticsQueryDto } from '../types/analytics';
import { useTenantMetrics } from '../analyticsQueries';

interface TenantMetricsProps {
  data: TenantMetricsDto[];
  query: AnalyticsQueryDto;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data, query }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState<'revenue' | 'invoiceCount' | 'paymentTimeliness'>('revenue');
  
  const { data: tenantMetrics, isLoading } = useTenantMetrics(query);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as 'revenue' | 'invoiceCount' | 'paymentTimeliness');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChartData = (tenants: TenantMetricsDto[], metric: 'revenue' | 'invoiceCount' | 'paymentTimeliness') => {
    const sortedTenants = [...tenants].sort((a, b) => {
      switch (metric) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'invoiceCount':
          return b.invoiceCount - a.invoiceCount;
        case 'paymentTimeliness':
          return b.paymentTimeliness - a.paymentTimeliness;
        default:
          return 0;
      }
    });

    return sortedTenants.slice(0, query.limit || 10).map((tenant, index) => ({
      x: index + 1,
      y: metric === 'revenue' ? tenant.totalRevenue :
         metric === 'invoiceCount' ? tenant.invoiceCount :
         tenant.paymentTimeliness,
      label: `${tenant.tenantName}\n${
        metric === 'revenue' ? formatCurrency(tenant.totalRevenue) :
        metric === 'invoiceCount' ? `${tenant.invoiceCount} invoices` :
        `${tenant.paymentTimeliness.toFixed(1)}% on time`
      }`,
      tenantName: tenant.tenantName,
      tenant,
    }));
  };

  const getCurrentTabData = () => {
    if (!tenantMetrics) return [];
    
    switch (tabValue) {
      case 0:
        return tenantMetrics.topByRevenue;
      case 1:
        return tenantMetrics.topByInvoiceCount;
      case 2:
        return tenantMetrics.bestPaymentTimeliness;
      default:
        return tenantMetrics.topByRevenue;
    }
  };

  const chartData = getChartData(getCurrentTabData(), sortBy);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return 'Total Revenue';
      case 'invoiceCount':
        return 'Invoice Count';
      case 'paymentTimeliness':
        return 'Payment Timeliness (%)';
      default:
        return metric;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Typography>Loading tenant data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Tabs for different tenant views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Top by Revenue" />
          <Tab label="Top by Invoices" />
          <Tab label="Best Payment" />
        </Tabs>
      </Box>

      {/* Sort Control */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="Sort by">
            <MenuItem value="revenue">Revenue</MenuItem>
            <MenuItem value="invoiceCount">Invoice Count</MenuItem>
            <MenuItem value="paymentTimeliness">Payment Timeliness</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Top by Revenue Chart */}
        <Box sx={{ height: 300, mb: 3 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={280}
            domainPadding={20}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 80, right: 40, top: 20, bottom: 60 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => 
                sortBy === 'revenue' ? formatCurrency(value) : 
                sortBy === 'paymentTimeliness' ? `${value}%` :
                value.toString()
              }
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider },
              }}
            />
            <VictoryAxis
              tickFormat={() => ''}
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryBar
              data={chartData}
              style={{
                data: { fill: theme.palette.primary.main },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                  }}
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  }}
                />
              }
            />
          </VictoryChart>
        </Box>
        
        {/* Revenue Tenant Cards */}
        <Grid container spacing={2}>
          {tenantMetrics?.topByRevenue.slice(0, 3).map((tenant) => (
            <Grid item xs={12} md={4} key={tenant.tenantId}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {tenant.tenantName}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Revenue:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(tenant.totalRevenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Invoices:</Typography>
                      <Chip size="small" label={tenant.invoiceCount} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Avg Value:</Typography>
                      <Typography variant="body2">
                        {formatCurrency(tenant.averageInvoiceValue)}
                      </Typography>
                    </Box>
                    {tenant.overdueCount > 0 && (
                      <Chip 
                        size="small" 
                        label={`${tenant.overdueCount} overdue`} 
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Top by Invoice Count Chart */}
        <Box sx={{ height: 300, mb: 3 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={280}
            domainPadding={20}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 80, right: 40, top: 20, bottom: 60 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => 
                sortBy === 'revenue' ? formatCurrency(value) : 
                sortBy === 'paymentTimeliness' ? `${value}%` :
                value.toString()
              }
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider },
              }}
            />
            <VictoryAxis
              tickFormat={() => ''}
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryBar
              data={getChartData(tenantMetrics?.topByInvoiceCount || [], sortBy)}
              style={{
                data: { fill: theme.palette.secondary.main },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                  }}
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  }}
                />
              }
            />
          </VictoryChart>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Best Payment Timeliness Chart */}
        <Box sx={{ height: 300, mb: 3 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={280}
            domainPadding={20}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 80, right: 40, top: 20, bottom: 60 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => 
                sortBy === 'revenue' ? formatCurrency(value) : 
                sortBy === 'paymentTimeliness' ? `${value}%` :
                value.toString()
              }
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider },
              }}
            />
            <VictoryAxis
              tickFormat={() => ''}
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryBar
              data={getChartData(tenantMetrics?.bestPaymentTimeliness || [], sortBy)}
              style={{
                data: { fill: theme.palette.success.main },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                  }}
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  }}
                />
              }
            />
          </VictoryChart>
        </Box>
      </TabPanel>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {`Displaying top ${Math.min(query.limit || 10, chartData.length)} tenants sorted by ${getMetricLabel(sortBy)}`}
      </Typography>
    </Box>
  );
};

export default TenantMetrics;