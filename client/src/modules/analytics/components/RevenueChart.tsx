import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryLabel,
  VictoryContainer,
} from 'victory';
import { useRevenueTrends, useTopCustomers } from '../analyticsQueries';
import { DateRange } from '../types/analytics';

interface RevenueChartProps {
  dateRange: DateRange;
  refreshKey?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ dateRange, refreshKey = 0 }) => {
  const [groupBy, setGroupBy] = useState<'month' | 'quarter' | 'year'>('month');
  
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useRevenueTrends(dateRange, groupBy, true);

  const {
    data: topCustomers,
    isLoading: customersLoading,
    error: customersError,
  } = useTopCustomers(dateRange, 5, true);

  if (revenueLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (revenueError) {
    return (
      <Alert severity="error">
        Failed to load revenue data: {revenueError.message}
      </Alert>
    );
  }

  if (!revenueData || !revenueData.data || revenueData.data.length === 0) {
    return (
      <Alert severity="info">
        No revenue data available for the selected date range.
      </Alert>
    );
  }

  const chartData = revenueData.data.map((item, index) => ({
    x: index + 1,
    y: item.revenue,
    label: item.label || item.period,
    invoiceCount: item.invoiceCount,
    avgValue: item.avgInvoiceValue,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Group By</InputLabel>
          <Select
            value={groupBy}
            label="Group By"
            onChange={(e) => setGroupBy(e.target.value as 'month' | 'quarter' | 'year')}
          >
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="quarter">Quarter</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="body2" color="text.secondary">
          Total Revenue: {formatCurrency(chartData.reduce((sum, item) => sum + item.y, 0))}
        </Typography>
      </Stack>

      <Box sx={{ width: '100%', height: 400 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={400}
          width={800}
          padding={{ left: 80, top: 20, right: 50, bottom: 60 }}
          containerComponent={<VictoryContainer responsive />}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => formatCurrency(value)}
            style={{
              tickLabels: { fontSize: 12, padding: 5 },
              grid: { stroke: "#e0e0e0" }
            }}
          />
          <VictoryAxis
            fixLabelOverlap={true}
            style={{
              tickLabels: { fontSize: 12, padding: 5, angle: -45 },
            }}
            tickFormat={(x) => {
              const item = chartData[x - 1];
              return item ? item.label : '';
            }}
          />
          <VictoryArea
            data={chartData}
            style={{
              data: { 
                fill: "#c43a31", 
                stroke: "#c43a31", 
                strokeWidth: 2, 
                fillOpacity: 0.3 
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: "#c43a31", strokeWidth: 2 }
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ 
                  fill: "white", 
                  stroke: "#c43a31", 
                  strokeWidth: 1 
                }}
                style={{ fontSize: 12, fill: "#333" }}
                renderInPortal={false}
              />
            }
            labels={({ datum }) => 
              `Revenue: ${formatCurrency(datum.y)}\nInvoices: ${datum.invoiceCount}\nAvg Value: ${formatCurrency(datum.avgValue)}`
            }
          />
        </VictoryChart>
      </Box>

      {topCustomers && topCustomers.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Top Customers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {topCustomers.slice(0, 5).map((customer, index) => (
                <Box
                  key={customer.customerName}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 1,
                    backgroundColor: index % 2 === 0 ? 'grey.50' : 'transparent',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {index + 1}. {customer.customerName}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {formatCurrency(customer.totalRevenue)} ({customer.revenuePercentage.toFixed(1)}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default RevenueChart;