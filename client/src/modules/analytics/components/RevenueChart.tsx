import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
} from 'victory';
import { RevenueMetrics } from '../types/analytics';

interface RevenueChartProps {
  readonly data: RevenueMetrics;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<'monthly' | 'quarterly'>('monthly');

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: 'monthly' | 'quarterly' | null,
  ) => {
    if (newViewType) {
      setViewType(newViewType);
    }
  };

  const chartData = viewType === 'monthly' 
    ? data.monthlyRevenue.map((item, index) => ({
        x: index + 1,
        y: item.revenue,
        label: `${item.month} ${item.year}\nRevenue: $${item.revenue.toLocaleString()}\nInvoices: ${item.invoiceCount}`,
      }))
    : data.quarterlyRevenue.map((item, index) => ({
        x: index + 1,
        y: item.revenue,
        label: `Q${item.quarter} ${item.year}\nRevenue: $${item.revenue.toLocaleString()}\nInvoices: ${item.invoiceCount}`,
      }));

  const formatTick = (tick: number) => {
    if (viewType === 'monthly') {
      const monthData = data.monthlyRevenue[tick - 1];
      return monthData ? `${monthData.month.slice(0, 3)}` : '';
    } else {
      const quarterData = data.quarterlyRevenue[tick - 1];
      return quarterData ? `Q${quarterData.quarter}` : '';
    }
  };

  const growthColor = data.revenueGrowth >= 0 ? theme.palette.success.main : theme.palette.error.main;

  return (
    <Card
      sx={{
        height: '500px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}>
      <CardHeader
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Revenue Trends
            </Typography>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              size="small">
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="quarterly">Quarterly</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Revenue: ${data.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color={growthColor}>
              Growth: {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}%
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ height: 'calc(100% - 120px)', p: 1 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          containerComponent={
            <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
          }
          padding={{ left: 80, top: 20, right: 50, bottom: 60 }}
          domainPadding={{ x: 20 }}>
          
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
            style={{
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
              grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
            }}
          />
          
          <VictoryAxis
            tickFormat={formatTick}
            style={{
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            }}
          />
          
          <VictoryArea
            data={chartData}
            style={{
              data: {
                fill: `${theme.palette.primary.main}20`,
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
          
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: theme.palette.primary.main, strokeWidth: 3 }
            }}
            labelComponent={
              <VictoryTooltip
                style={{
                  fill: theme.palette.text.primary,
                  fontSize: 12,
                }}
                flyoutStyle={{
                  stroke: theme.palette.divider,
                  fill: theme.palette.background.paper,
                }}
              />
            }
          />
        </VictoryChart>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;