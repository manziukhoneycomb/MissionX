import React from 'react';
import { Box, Typography } from '@mui/material';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip } from 'victory';
import { AgingAnalysis } from '../types/analytics';

interface AgingAnalysisChartProps {
  data?: AgingAnalysis;
}

const AgingAnalysisChart: React.FC<AgingAnalysisChartProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No aging analysis data available</Typography>
      </Box>
    );
  }

  const chartData = [
    {
      x: 'Current',
      y: data.current,
      color: '#4caf50',
      description: 'Not yet due'
    },
    {
      x: '1-30 Days',
      y: data.days1to30,
      color: '#ff9800',
      description: '1-30 days past due'
    },
    {
      x: '31-60 Days',
      y: data.days31to60,
      color: '#ff5722',
      description: '31-60 days past due'
    },
    {
      x: '61-90 Days',
      y: data.days61to90,
      color: '#f44336',
      description: '61-90 days past due'
    },
    {
      x: '90+ Days',
      y: data.over90Days,
      color: '#9c27b0',
      description: 'Over 90 days past due'
    },
  ];

  const total = data.current + data.days1to30 + data.days31to60 + data.days61to90 + data.over90Days;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Invoice Aging Distribution
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Total: {total.toLocaleString()} invoices
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={280}
          width={700}
          padding={{ left: 60, top: 20, right: 60, bottom: 80 }}
          domainPadding={25}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => x.toString()}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 12, fill: '#666' }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 11, fill: '#666', angle: -15 }
            }}
          />
          <VictoryBar
            data={chartData}
            x="x"
            y="y"
            style={{
              data: { 
                fill: ({ datum }) => datum.color,
                fillOpacity: 0.8
              }
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: 'white', stroke: '#ccc' }}
                style={{ fontSize: 12 }}
                renderInPortal={false}
                text={({ datum }) => [
                  datum.description,
                  `Count: ${datum.y}`,
                  total > 0 ? `${((datum.y / total) * 100).toFixed(1)}% of total` : ''
                ]}
              />
            }
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
        </VictoryChart>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
        {chartData.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {item.x}: {item.y}
              {total > 0 && ` (${((item.y / total) * 100).toFixed(1)}%)`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AgingAnalysisChart;