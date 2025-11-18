import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { GetApp as ExportIcon } from '@mui/icons-material';
import {
  VictoryChart,
  VictoryPie,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
} from 'victory';
import { format, parseISO } from 'date-fns';
import { PaymentDistributionAnalytics } from '../types/analytics';

interface PaymentDistributionProps {
  data?: PaymentDistributionAnalytics;
}

type ViewMode = 'methods' | 'trends';

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('methods');

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Analytics
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">No payment data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'MMM yyyy');
  };

  const methodColors = ['#1976d2', '#2196f3', '#03a9f4', '#00bcd4', '#009688'];

  const pieData = data.paymentMethods.map((method) => ({
    x: method.method,
    y: method.count,
    amount: method.totalAmount,
    percentage: method.percentage,
  }));

  const trendData = data.paymentTrends.map((point, index) => ({
    x: index + 1,
    y: point.percentage,
    label: `${formatDate(point.date)}\nOn-time: ${point.onTime}\nLate: ${point.late}\nRate: ${point.percentage.toFixed(1)}%`,
    date: point.date,
  }));

  const handleMethodClick = (method: string) => {
    console.log('Filter invoices by payment method:', method);
  };

  const handleExport = () => {
    console.log('Export payment analytics data');
    const csvData = data.paymentMethods.map(method => 
      `${method.method},${method.count},${method.totalAmount},${method.percentage}`
    ).join('\n');
    
    const header = 'Payment Method,Count,Total Amount,Percentage\n';
    const csv = header + csvData;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Payment Analytics
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant={viewMode === 'methods' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('methods')}
              >
                Methods
              </Button>
              <Button
                size="small"
                variant={viewMode === 'trends' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('trends')}
              >
                Trends
              </Button>
            </Stack>
            <Tooltip title="Export Data">
              <IconButton size="small" onClick={handleExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <Chip
            label={`Avg Payment Time: ${data.averagePaymentTime.toFixed(1)} days`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`On-Time Rate: ${data.onTimePaymentRate.toFixed(1)}%`}
            color={data.onTimePaymentRate >= 80 ? 'success' : data.onTimePaymentRate >= 60 ? 'warning' : 'error'}
            variant="outlined"
          />
        </Stack>

        {viewMode === 'methods' ? (
          <Box>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <VictoryPie
                data={pieData}
                width={300}
                height={250}
                innerRadius={50}
                padAngle={2}
                colorScale={methodColors}
                labelComponent={<VictoryTooltip />}
                animate={{ duration: 1000 }}
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => ({
                      target: "data",
                      mutation: (props) => {
                        const method = pieData[props.index].x;
                        handleMethodClick(method);
                        return null;
                      }
                    })
                  }
                }]}
              />
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payment Method Breakdown
            </Typography>
            <List dense>
              {data.paymentMethods.map((method, index) => (
                <React.Fragment key={method.method}>
                  <ListItem
                    button
                    onClick={() => handleMethodClick(method.method)}
                    sx={{ px: 0 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: methodColors[index % methodColors.length],
                        borderRadius: '50%',
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {method.method}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${method.percentage.toFixed(1)}%`}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {method.count} ({formatCurrency(method.totalAmount)})
                            </Typography>
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < data.paymentMethods.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            <Box sx={{ height: 250, width: '100%' }}>
              <VictoryChart
                theme={VictoryTheme.material}
                height={250}
                width={500}
                padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
              >
                <VictoryAxis
                  dependentAxis
                  tickFormat={(value) => `${value}%`}
                  domain={[0, 100]}
                  style={{
                    tickLabels: { fontSize: 11, padding: 5 },
                    grid: { stroke: "#e0e0e0" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(x, i) => {
                    const point = data.paymentTrends[x - 1];
                    return point ? formatDate(point.date) : '';
                  }}
                  style={{
                    tickLabels: { fontSize: 10, padding: 5, angle: -45 },
                  }}
                />
                
                <VictoryLine
                  data={trendData}
                  style={{
                    data: { stroke: "#1976d2", strokeWidth: 3 }
                  }}
                  labelComponent={<VictoryTooltip />}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
              </VictoryChart>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Payment Timeliness Trends
            </Typography>
            <Stack spacing={1}>
              {data.paymentTrends.slice(-3).map((trend) => (
                <Box key={trend.date} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {formatDate(trend.date)}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {trend.onTime} on-time, {trend.late} late
                    </Typography>
                    <Chip
                      label={`${trend.percentage.toFixed(1)}%`}
                      size="small"
                      color={trend.percentage >= 80 ? 'success' : trend.percentage >= 60 ? 'warning' : 'error'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDistribution;