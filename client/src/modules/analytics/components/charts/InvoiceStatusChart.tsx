import React, { useState } from 'react';
import {
  VictoryPie,
  VictoryChart,
  VictoryTheme,
  VictoryContainer,
  VictoryTooltip,
  VictoryLabel,
} from 'victory';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Typography,
} from '@mui/material';
import { InvoiceStatus } from '../../types/analytics';

interface InvoiceStatusChartProps {
  data: InvoiceStatus[];
  height?: number;
}

type ViewType = 'count' | 'amount';

const InvoiceStatusChart: React.FC<InvoiceStatusChartProps> = ({
  data,
  height = 300,
}) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<ViewType>('count');

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewType | null) => {
    if (newView) {
      setViewType(newView);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.palette.success.main;
      case 'unpaid':
        return theme.palette.warning.main;
      case 'overdue':
        return theme.palette.error.main;
      case 'draft':
        return theme.palette.grey[500];
      default:
        return theme.palette.primary.main;
    }
  };

  const formatValue = (value: number) => {
    if (viewType === 'amount') {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  const chartData = data.map(item => ({
    x: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    y: viewType === 'count' ? item.count : item.totalAmount,
    label: `${item.status.charAt(0).toUpperCase() + item.status.slice(1)}: ${
      viewType === 'count'
        ? `${item.count} invoices (${item.percentage}%)`
        : formatValue(item.totalAmount)
    }`,
    percentage: item.percentage,
    count: item.count,
    amount: item.totalAmount,
    status: item.status,
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
          {datum.x}
        </Typography>
        <Typography variant="body2">
          Count: {datum.count} ({datum.percentage}%)
        </Typography>
        <Typography variant="body2">
          Amount: ${datum.amount.toLocaleString()}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Invoice Status Distribution
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="count">Count</ToggleButton>
          <ToggleButton value="amount">Amount</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <VictoryPie
        data={chartData}
        width={400}
        height={height}
        innerRadius={60}
        padAngle={3}
        colorScale={chartData.map(item => getStatusColor(item.status))}
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
            key={item.status}
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
                backgroundColor: getStatusColor(item.status),
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2">
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              {' '}({item.percentage}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InvoiceStatusChart;