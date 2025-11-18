import React from 'react';
import {
  VictoryPie,
  VictoryContainer,
  VictoryTooltip,
} from 'victory';
import { Box, useTheme, Typography } from '@mui/material';
import { PaymentDistribution, PaymentMethodDistribution } from '../../types/analytics';

interface PaymentDistributionChartProps {
  data: PaymentDistribution[] | PaymentMethodDistribution[];
  height?: number;
}

const PaymentDistributionChart: React.FC<PaymentDistributionChartProps> = ({
  data,
  height = 300,
}) => {
  const theme = useTheme();

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'bank transfer':
        return theme.palette.primary.main;
      case 'credit card':
        return theme.palette.secondary.main;
      case 'check':
        return theme.palette.success.main;
      case 'cash':
        return theme.palette.warning.main;
      case 'paypal':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatAmount = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const chartData = data.map(item => ({
    x: item.method,
    y: item.amount,
    label: `${item.method}: ${formatAmount(item.amount)} (${item.percentage}%)`,
    count: item.count,
    percentage: item.percentage,
    amount: item.amount,
    method: item.method,
  }));

  const customTooltip = ({ datum }: any) => {
    if (!datum) return null;
    
    return (
      <Box
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 2,
          boxShadow: theme.shadows[2],
          minWidth: 150,
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {datum.method}
        </Typography>
        <Typography variant="body2">
          Amount: {formatAmount(datum.amount)}
        </Typography>
        <Typography variant="body2">
          Count: {datum.count} payments
        </Typography>
        <Typography variant="body2">
          Share: {datum.percentage}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <VictoryPie
        data={chartData}
        width={400}
        height={height}
        innerRadius={50}
        padAngle={2}
        colorScale={chartData.map(item => getMethodColor(item.method))}
        labelComponent={
          <VictoryTooltip 
            flyoutComponent={customTooltip}
            cornerRadius={4}
            pointerLength={8}
          />
        }
        animate={{
          duration: 1000,
        }}
        containerComponent={<VictoryContainer responsive />}
      />

      {/* Legend */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mt: 2,
        }}
      >
        {data.map(item => (
          <Box
            key={item.method}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: getMethodColor(item.method),
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2">
              {item.method} ({item.percentage}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PaymentDistributionChart;