import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryPie,
  VictoryContainer,
} from 'victory';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { usePaymentDistribution } from '../analyticsQueries';
import { DateRangeFilter } from '../services/analyticsService';

interface PaymentDistributionProps {
  filters?: DateRangeFilter;
}

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ filters }) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data, isLoading, error } = usePaymentDistribution(filters);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    if (data?.data) {
      const csvData = data.data.map(item => ({
        'Payment Method': item.method,
        Count: item.count,
        Percentage: `${item.percentage}%`,
        'Total Amount': item.totalAmount,
      }));
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payment-distribution.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load payment distribution data. Please try again later.
      </Alert>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
        <Typography variant="body1" color="textSecondary">
          No payment data available for the selected period.
        </Typography>
      </Box>
    );
  }

  const getMethodColor = (method: string, index: number) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b', '#5d4037'];
    return colors[index % colors.length];
  };

  const chartData = data.data.map((item, index) => ({
    x: chartType === 'pie' ? item.method : index + 1,
    y: chartType === 'pie' ? item.percentage : item.totalAmount,
    label: `${item.method}: ${item.count} (${item.percentage}%) - $${item.totalAmount.toLocaleString()}`,
    method: item.method,
    count: item.count,
    percentage: item.percentage,
    amount: item.totalAmount,
  }));

  const totalTransactions = data.data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ButtonGroup size="small">
          <Button
            variant={chartType === 'pie' ? 'contained' : 'outlined'}
            onClick={() => setChartType('pie')}
          >
            Pie Chart
          </Button>
          <Button
            variant={chartType === 'bar' ? 'contained' : 'outlined'}
            onClick={() => setChartType('bar')}
          >
            Bar Chart
          </Button>
        </ButtonGroup>

        <IconButton onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleExport}>
            Export Data (CSV)
          </MenuItem>
        </Menu>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="textSecondary">
                Total Payments
              </Typography>
              <Typography variant="h6">
                {totalTransactions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="caption" color="textSecondary">
                Total Value
              </Typography>
              <Typography variant="h6">
                ${totalAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      {chartType === 'pie' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: '100%', height: 250 }}>
            <VictoryPie
              data={chartData}
              x="x"
              y="y"
              width={320}
              height={250}
              innerRadius={50}
              padAngle={2}
              colorScale={data.data.map((_, index) => getMethodColor('', index))}
              labelComponent={<VictoryTooltip />}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              containerComponent={<VictoryContainer responsive={true} />}
            />
          </Box>
          
          {/* Legend */}
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {data.data.map((item, index) => (
              <Box 
                key={item.method} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  fontSize: '0.75rem'
                }}
              >
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: getMethodColor(item.method, index),
                    borderRadius: 1
                  }} 
                />
                <Typography variant="caption">
                  {item.method} ({item.percentage}%)
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 280 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={20}
            width={400}
            height={280}
            padding={{ left: 80, right: 40, top: 20, bottom: 80 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${(t / 1000)}K`}
              style={{
                tickLabels: { fontSize: 11 },
                grid: { stroke: "#e0e0e0" }
              }}
            />
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 10, angle: -45 },
              }}
              tickFormat={(x) => {
                const item = data.data[x - 1];
                return item ? (item.method.length > 10 ? `${item.method.substring(0, 10)}...` : item.method) : '';
              }}
            />
            <VictoryBar
              data={chartData}
              x="x"
              y="y"
              style={{
                data: { 
                  fill: (datum: any) => getMethodColor('', datum.x - 1)
                }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        </Box>
      )}

      {/* Detailed Breakdown */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Payment Method Breakdown:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.data.map((item, index) => (
            <Box 
              key={item.method}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1,
                borderRadius: 1,
                backgroundColor: 'action.hover'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    backgroundColor: getMethodColor(item.method, index),
                    borderRadius: '50%'
                  }} 
                />
                <Typography variant="body2" fontWeight="medium">
                  {item.method}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium">
                  ${item.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {item.count} transactions ({item.percentage}%)
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentDistribution;