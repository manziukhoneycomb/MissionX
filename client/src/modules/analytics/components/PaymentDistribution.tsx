import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryStack,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryPie,
} from 'victory';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { usePaymentDistribution } from '../analyticsQueries';
import { useAnalyticsFilters } from './AnalyticsPage';

type ChartType = 'bar' | 'pie' | 'table';

const PaymentDistribution: React.FC = () => {
  const theme = useTheme();
  const { filters } = useAnalyticsFilters();
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const { data: paymentData, isLoading, error } = usePaymentDistribution(filters);

  const handleChartTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ChartType | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleExportData = () => {
    if (!paymentData) return;
    
    const csvContent = [
      ['Payment Method', 'Count', 'Total Amount', 'Percentage'].join(','),
      ...paymentData.map(item => [
        item.paymentMethod,
        item.count,
        item.totalAmount,
        `${item.percentage.toFixed(1)}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-distribution.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        Failed to load payment distribution data
      </Alert>
    );
  }

  if (!paymentData || paymentData.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No payment distribution data available
      </Alert>
    );
  }

  const totalTransactions = paymentData.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = paymentData.reduce((sum, item) => sum + item.totalAmount, 0);

  const chartData = paymentData.map((item) => ({
    x: item.paymentMethod,
    y: item.totalAmount,
    count: item.count,
    percentage: item.percentage,
  }));

  const pieData = paymentData.map((item) => ({
    x: item.paymentMethod,
    y: item.count,
    label: `${item.paymentMethod}: ${item.count} (${item.percentage.toFixed(1)}%)`,
  }));

  const getPaymentMethodColor = (index: number) => {
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

  const chartTheme = {
    ...VictoryTheme.material,
    axis: {
      ...VictoryTheme.material.axis,
      style: {
        ...VictoryTheme.material.axis.style,
        tickLabels: {
          ...VictoryTheme.material.axis.style.tickLabels,
          fill: theme.palette.text.primary,
        },
        axis: {
          ...VictoryTheme.material.axis.style.axis,
          stroke: theme.palette.divider,
        },
        grid: {
          ...VictoryTheme.material.axis.style.grid,
          stroke: theme.palette.divider,
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {totalTransactions} transactions • ${totalAmount.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleExportData}
            title="Export to CSV"
          >
            <FileDownload />
          </IconButton>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
          >
            <ToggleButton value="bar">Bar</ToggleButton>
            <ToggleButton value="pie">Pie</ToggleButton>
            <ToggleButton value="table">Table</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {chartType === 'bar' && (
        <Box sx={{ width: '100%', height: 300 }}>
          <VictoryChart
            theme={chartTheme}
            domainPadding={{ x: 20 }}
            padding={{ left: 70, top: 20, right: 40, bottom: 60 }}
            width={500}
            height={300}
            containerComponent={<VictoryContainer responsive={true} />}
          >
            <VictoryAxis dependentAxis tickFormat={(t) => `$${t / 1000}k`} />
            <VictoryAxis
              tickFormat={(x) => x.length > 8 ? `${x.substring(0, 8)}...` : x}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end' }
              }}
            />
            
            <VictoryBar
              data={chartData}
              style={{
                data: { 
                  fill: ({ index }) => getPaymentMethodColor(index),
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                  style={{ fill: theme.palette.text.primary }}
                  renderInPortal={false}
                />
              }
            />
          </VictoryChart>
        </Box>
      )}

      {chartType === 'pie' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', height: 350 }}>
          <VictoryPie
            data={pieData}
            width={400}
            height={350}
            innerRadius={50}
            padAngle={2}
            colorScale={paymentData.map((_, index) => getPaymentMethodColor(index))}
            containerComponent={<VictoryContainer responsive={true} />}
            animate={{
              duration: 1000,
            }}
            labelRadius={({ innerRadius }) => (innerRadius as number) + 80 }
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{
                  fill: theme.palette.background.paper,
                  stroke: theme.palette.divider,
                }}
                style={{ fill: theme.palette.text.primary }}
                renderInPortal={false}
              />
            }
          />
        </Box>
      )}

      {chartType === 'table' && (
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Percentage</TableCell>
                <TableCell align="right">Avg. Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentData.map((item, index) => (
                <TableRow key={item.paymentMethod} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getPaymentMethodColor(index),
                        }}
                      />
                      {item.paymentMethod}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                  <TableCell align="right">${item.totalAmount.toLocaleString()}</TableCell>
                  <TableCell align="right">{item.percentage.toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    ${(item.totalAmount / item.count).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PaymentDistribution;