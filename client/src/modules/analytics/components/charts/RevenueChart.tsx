import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryLabel,
} from 'victory';
import { Box, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { RevenueMetrics } from '../../types/analytics';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: RevenueMetrics;
  height?: number;
}

type ChartType = 'line' | 'area';

const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 300 }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('area');

  const handleChartTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: ChartType | null) => {
    if (newType) {
      setChartType(newType);
    }
  };

  const chartData = data.trends.map((point, index) => ({
    x: index + 1,
    y: point.value,
    label: `${point.date}: $${point.value.toLocaleString()}`,
    date: point.date,
  }));

  const formatXAxis = (tickValue: number) => {
    const dataPoint = data.trends[tickValue - 1];
    if (!dataPoint) return '';
    
    try {
      return format(parseISO(dataPoint.date + '-01'), 'MMM yy');
    } catch {
      return dataPoint.date;
    }
  };

  const formatYAxis = (tickValue: number) => {
    if (tickValue >= 1000000) {
      return `$${(tickValue / 1000000).toFixed(1)}M`;
    } else if (tickValue >= 1000) {
      return `$${(tickValue / 1000).toFixed(0)}K`;
    }
    return `$${tickValue.toLocaleString()}`;
  };

  const customTooltip = ({ datum }: any) => {
    if (!datum) return null;
    
    return (
      <Box
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1,
          boxShadow: theme.shadows[2],
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {datum.date}
        </div>
        <div style={{ fontSize: '12px', color: theme.palette.primary.main }}>
          Revenue: ${datum.y.toLocaleString()}
        </div>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="line">Line</ToggleButton>
          <ToggleButton value="area">Area</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <VictoryChart
        theme={VictoryTheme.material}
        width={800}
        height={height}
        padding={{ left: 80, right: 50, top: 20, bottom: 60 }}
        containerComponent={<VictoryContainer responsive />}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={formatYAxis}
          style={{
            grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
          }}
        />
        <VictoryAxis
          tickFormat={formatXAxis}
          style={{
            grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
          }}
        />

        {chartType === 'area' ? (
          <VictoryArea
            data={chartData}
            style={{
              data: {
                fill: theme.palette.primary.main,
                fillOpacity: 0.2,
                stroke: theme.palette.primary.main,
                strokeWidth: 2,
              },
            }}
            labelComponent={<VictoryTooltip flyoutComponent={customTooltip} />}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        ) : (
          <VictoryLine
            data={chartData}
            style={{
              data: {
                stroke: theme.palette.primary.main,
                strokeWidth: 3,
              },
            }}
            labelComponent={<VictoryTooltip flyoutComponent={customTooltip} />}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        )}
      </VictoryChart>
    </Box>
  );
};

export default RevenueChart;