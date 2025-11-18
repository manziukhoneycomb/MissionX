import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryArea,
  VictoryStack,
} from 'victory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PaymentMethodMetric } from '../types/analytics';

interface PaymentDistributionProps {
  data: PaymentMethodMetric[];
}

type ChartType = 'bar' | 'stacked' | 'area';

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [metric, setMetric] = useState<'count' | 'amount'>('amount');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    const csvData = data.map(item => ({
      'Payment Method': item.method,
      Count: item.count,
      'Total Amount': item.totalAmount,
      'Percentage': `${item.percentage}%`,
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payment-distribution.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const getMethodColor = (_method: string, index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    return colors[index % colors.length];
  };

  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: metric === 'amount' ? item.totalAmount : item.count,
    method: item.method,
    count: item.count,
    amount: item.totalAmount,
    percentage: item.percentage,
    color: getMethodColor(item.method, index),
  }));

  const formatValue = (value: number) => {
    if (metric === 'count') {
      return value.toString();
    }
    return `$${(value / 1000).toFixed(0)}k`;
  };

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No payment distribution data available
        </Typography>
      </Paper>
    );
  }

  const renderChart = () => {
    const commonProps = {
      theme: {
        axis: {
          style: {
            axis: { stroke: theme.palette.divider },
            tickLabels: { fill: theme.palette.text.secondary, fontSize: 11 },
            grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
          },
        },
      },
      padding: { left: 70, right: 40, top: 20, bottom: 80 },
      height: 280,
    };

    switch (chartType) {
      case 'stacked':
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => formatValue(value)}
              style={{
                grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
              }}
            />
            <VictoryAxis
              tickFormat={(_, index) => {
                const method = chartData[index]?.method || '';
                return method.length > 10 ? `${method.substring(0, 10)}...` : method;
              }}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end' },
              }}
            />
            
            <VictoryStack colorScale={chartData.map(d => d.color)}>
              {chartData.map((item, index) => (
                <VictoryBar
                  key={index}
                  data={[item]}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
              ))}
            </VictoryStack>
            
            <VictoryTooltip
              renderInPortal={false}
              flyoutStyle={{
                stroke: theme.palette.divider,
                fill: theme.palette.background.paper,
              }}
              labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 11 }} />}
              datum={(datum: any) => 
                `${datum.method}\n${metric === 'amount' ? `$${datum.amount.toLocaleString()}` : `${datum.count} payments`}\n${datum.percentage}%`
              }
            />
          </VictoryChart>
        );

      case 'area':
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => formatValue(value)}
              style={{
                grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
              }}
            />
            <VictoryAxis
              tickFormat={(_, index) => {
                const method = chartData[index]?.method || '';
                return method.length > 10 ? `${method.substring(0, 10)}...` : method;
              }}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end' },
              }}
            />
            
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: theme.palette.primary.main,
                  fillOpacity: 0.6,
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            
            <VictoryTooltip
              renderInPortal={false}
              flyoutStyle={{
                stroke: theme.palette.divider,
                fill: theme.palette.background.paper,
              }}
              labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 11 }} />}
              datum={(datum: any) => 
                `${datum.method}\n${metric === 'amount' ? `$${datum.amount.toLocaleString()}` : `${datum.count} payments`}\n${datum.percentage}%`
              }
            />
          </VictoryChart>
        );

      default:
        return (
          <VictoryChart {...commonProps}>
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => formatValue(value)}
              style={{
                grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
              }}
            />
            <VictoryAxis
              tickFormat={(_, index) => {
                const method = chartData[index]?.method || '';
                return method.length > 10 ? `${method.substring(0, 10)}...` : method;
              }}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end' },
              }}
            />
            
            <VictoryBar
              data={chartData}
              style={{
                data: {
                  fill: (props: any) => chartData[props.index]?.color || theme.palette.primary.main,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            
            <VictoryTooltip
              renderInPortal={false}
              flyoutStyle={{
                stroke: theme.palette.divider,
                fill: theme.palette.background.paper,
              }}
              labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 11 }} />}
              datum={(datum: any) => 
                `${datum.method}\n${metric === 'amount' ? `$${datum.amount.toLocaleString()}` : `${datum.count} payments`}\n${datum.percentage}%`
              }
            />
          </VictoryChart>
        );
    }
  };

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Payment Distribution</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={metric}
              label="Metric"
              onChange={(e) => setMetric(e.target.value as any)}
            >
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="count">Count</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={chartType}
              label="Type"
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="stacked">Stacked</MenuItem>
              <MenuItem value="area">Area</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleExport}>Export CSV</MenuItem>
      </Menu>

      <Box sx={{ height: 320 }}>
        {renderChart()}
      </Box>
    </Paper>
  );
};

export default PaymentDistribution;