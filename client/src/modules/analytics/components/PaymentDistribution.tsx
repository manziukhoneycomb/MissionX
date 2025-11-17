import React from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryContainer,
} from 'victory';
import { usePaymentDistribution } from '../analyticsQueries';
import { DateRange } from '../types/analytics';

interface PaymentDistributionProps {
  dateRange: DateRange;
  refreshKey?: number;
}

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ 
  dateRange, 
  refreshKey = 0 
}) => {
  const {
    data: paymentData,
    isLoading,
    error,
  } = usePaymentDistribution(dateRange, true);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load payment distribution data: {error.message}
      </Alert>
    );
  }

  if (!paymentData || !paymentData.overview) {
    return (
      <Alert severity="info">
        No payment distribution data available for the selected date range.
      </Alert>
    );
  }

  const { overview } = paymentData;
  const { volumeDistribution, totalPayments, totalValue, averagePayment } = overview;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = volumeDistribution.map((item, index) => ({
    x: index + 1,
    y: item.count,
    label: item.rangeLabel,
    value: item.totalValue,
    percentage: item.percentage,
  }));

  const getAmountRangeColor = (index: number) => {
    const colors = ['#e3f2fd', '#bbdefb', '#90caf9', '#42a5f5', '#1e88e5'];
    return colors[index % colors.length];
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Total Payments
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalPayments.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Average
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(averagePayment)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Volume Distribution Bar Chart */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Payment Volume Distribution
          </Typography>
          <Box sx={{ width: '100%', height: 280 }}>
            <VictoryChart
              theme={VictoryTheme.material}
              height={280}
              width={500}
              padding={{ left: 80, top: 20, right: 50, bottom: 80 }}
              domainPadding={20}
              containerComponent={<VictoryContainer responsive />}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(value) => `${value}`}
                style={{
                  tickLabels: { fontSize: 11, padding: 5 },
                  grid: { stroke: "#e0e0e0" }
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10, padding: 5, angle: -45 },
                }}
                tickFormat={(x) => {
                  const item = chartData[x - 1];
                  return item ? item.label : '';
                }}
              />
              <VictoryBar
                data={chartData}
                style={{
                  data: { fill: "#1976d2" }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{ 
                      fill: "white", 
                      stroke: "#1976d2", 
                      strokeWidth: 1 
                    }}
                    style={{ fontSize: 12, fill: "#333" }}
                    renderInPortal={false}
                  />
                }
                labels={({ datum }) => 
                  `${datum.label}\n${datum.y} payments\n${formatCurrency(datum.value)}\n${datum.percentage.toFixed(1)}%`
                }
              />
            </VictoryChart>
          </Box>
        </Box>

        <Divider />

        {/* Detailed Volume Breakdown */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Volume Details
          </Typography>
          <Stack spacing={2}>
            {volumeDistribution.map((item, index) => (
              <Box
                key={item.rangeLabel}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: getAmountRangeColor(index),
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.rangeLabel}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.count} payments ({item.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                    {formatCurrency(item.totalValue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg: {formatCurrency(item.count > 0 ? item.totalValue / item.count : 0)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Payment Insights */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Payment Insights
          </Typography>
          <Grid container spacing={2}>
            {volumeDistribution.length > 0 && (
              <>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Most Common Range
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {volumeDistribution.reduce((max, current) => 
                          current.count > max.count ? current : max
                        ).rangeLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {volumeDistribution.reduce((max, current) => 
                          current.count > max.count ? current : max
                        ).count} payments
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Highest Value Range
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {volumeDistribution.reduce((max, current) => 
                          current.totalValue > max.totalValue ? current : max
                        ).rangeLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(volumeDistribution.reduce((max, current) => 
                          current.totalValue > max.totalValue ? current : max
                        ).totalValue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default PaymentDistribution;