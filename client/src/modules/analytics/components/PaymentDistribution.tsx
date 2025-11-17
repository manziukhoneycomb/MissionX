import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  VictoryChart,
  VictoryPie,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryStack,
  VictoryArea,
} from 'victory';
import { GetApp, Timeline } from '@mui/icons-material';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import { usePaymentDistribution } from '../analyticsQueries';

type TabValue = 'methods' | 'timing';

const PaymentDistribution: React.FC = () => {
  const theme = useTheme();
  const { filter } = useAnalyticsFilter();
  const [activeTab, setActiveTab] = useState<TabValue>('methods');

  const query = {
    dateRange: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    tenantIds: filter.selectedTenants.length > 0 ? filter.selectedTenants : undefined,
  };

  const { data, isLoading, error } = usePaymentDistribution(query);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load payment distribution data. Please try again.
      </Alert>
    );
  }

  if (!data || data.paymentMethods.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No payment data available for the selected period.
      </Alert>
    );
  }

  const exportData = () => {
    const csvData = [
      ...data.paymentMethods.map(method => ({
        Type: 'Payment Method',
        Category: method.method,
        Count: method.count,
        'Total Amount': method.totalAmount,
        Percentage: method.percentage,
        'Average Amount': method.averageAmount,
      })),
      ...data.paymentTiming.map(timing => ({
        Type: 'Payment Timing',
        Category: timing.category,
        Count: timing.count,
        'Total Amount': timing.totalAmount,
        Percentage: timing.percentage,
        'Average Days': timing.averageDays,
      })),
    ];
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payment-distribution.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Color palettes
  const methodColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const timingColors = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const methodPieData = data.paymentMethods.map((method) => ({
    x: method.method,
    y: method.count,
    label: `${method.method}\n$${method.totalAmount.toLocaleString()} (${method.percentage.toFixed(1)}%)`,
  }));

  const timingBarData = data.paymentTiming.map((timing) => ({
    x: timing.category,
    y: timing.count,
    label: `${timing.category}: ${timing.count} payments (${timing.averageDays} days avg)`,
  }));

  const renderMethodsChart = () => (
    <Grid container spacing={3}>
      {/* Pie Chart */}
      <Grid item xs={12} md={8}>
        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
          <VictoryPie
            data={methodPieData}
            theme={VictoryTheme.material}
            colorScale={methodColors}
            labelComponent={<VictoryTooltip />}
            padAngle={2}
            innerRadius={50}
            animate={{
              duration: 1000,
            }}
            labelRadius={({ innerRadius }) => innerRadius + 50 }
            style={{
              labels: { fontSize: 11, fill: theme.palette.text.primary },
            }}
          />
        </Box>
      </Grid>
      
      {/* Method Details */}
      <Grid item xs={12} md={4}>
        <Box sx={{ height: 300, overflow: 'auto' }}>
          {data.paymentMethods.map((method, index) => (
            <Card key={method.method} variant="outlined" sx={{ mb: 1, p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: methodColors[index % methodColors.length],
                    mr: 1,
                  }}
                />
                <Typography variant="subtitle2" fontWeight="bold">
                  {method.method}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {method.count} transactions ({method.percentage.toFixed(1)}%)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${method.totalAmount.toLocaleString()} total
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${method.averageAmount.toLocaleString()} average
              </Typography>
            </Card>
          ))}
        </Box>
      </Grid>
    </Grid>
  );

  const renderTimingChart = () => (
    <Box sx={{ height: 350 }}>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={20}
        height={350}
        padding={{ left: 60, top: 20, right: 20, bottom: 100 }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(value) => value.toString()}
          style={{
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            axis: { stroke: theme.palette.divider },
            grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
          }}
        />
        <VictoryAxis
          style={{
            tickLabels: { 
              fontSize: 10, 
              fill: theme.palette.text.secondary,
              angle: -45,
            },
            axis: { stroke: theme.palette.divider },
          }}
        />
        <VictoryBar
          data={timingBarData}
          style={{
            data: {
              fill: ({ index }) => timingColors[index % timingColors.length],
              stroke: theme.palette.background.paper,
              strokeWidth: 1,
            },
          }}
          labelComponent={<VictoryTooltip />}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      </VictoryChart>
    </Box>
  );

  const renderSummaryStats = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" color="primary">
            {data.totalPayments}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Payments
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" color="success.main">
            ${data.totalAmount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" color="info.main">
            ${data.averagePaymentAmount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average Payment
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="h6" color="warning.main">
            {data.averageDaysToPayment} days
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Days to Payment
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, value) => setActiveTab(value)}
          size="small"
        >
          <Tab label="Payment Methods" value="methods" />
          <Tab label="Payment Timing" value="timing" />
        </Tabs>
        
        <Tooltip title="Export Data">
          <IconButton size="small" onClick={exportData}>
            <GetApp />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Stats */}
      {renderSummaryStats()}

      <Divider sx={{ mb: 3 }} />

      {/* Charts */}
      <Box>
        {activeTab === 'methods' ? renderMethodsChart() : renderTimingChart()}
      </Box>

      {/* Timing Legend */}
      {activeTab === 'timing' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
          {data.paymentTiming.map((timing, index) => (
            <Box key={timing.category} sx={{ display: 'flex', alignItems: 'center', mx: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 1,
                  backgroundColor: timingColors[index % timingColors.length],
                  mr: 0.5,
                }}
              />
              <Typography variant="caption">
                {timing.category} ({timing.count})
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PaymentDistribution;