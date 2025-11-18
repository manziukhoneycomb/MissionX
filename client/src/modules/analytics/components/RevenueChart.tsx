import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryArea } from 'victory';
import { RevenueMetrics } from '../types/analytics';

interface RevenueChartProps {
  data?: RevenueMetrics;
}

type ViewType = 'monthly' | 'quarterly';

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [viewType, setViewType] = useState<ViewType>('monthly');

  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No revenue data available</Typography>
      </Box>
    );
  }

  const chartData = viewType === 'monthly' 
    ? data.monthlyRevenue.map((item, index) => ({
        x: index + 1,
        y: item.revenue,
        label: item.month,
      }))
    : data.quarterlyRevenue.map((item, index) => ({
        x: index + 1,
        y: item.revenue,
        label: item.quarter,
      }));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Revenue: ${data.totalRevenue.toLocaleString()}
        </Typography>
        <ButtonGroup size="small">
          <Button 
            variant={viewType === 'monthly' ? 'contained' : 'outlined'}
            onClick={() => setViewType('monthly')}
          >
            Monthly
          </Button>
          <Button 
            variant={viewType === 'quarterly' ? 'contained' : 'outlined'}
            onClick={() => setViewType('quarterly')}
          >
            Quarterly
          </Button>
        </ButtonGroup>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={280}
          width={600}
          padding={{ left: 80, top: 20, right: 80, bottom: 60 }}
          domainPadding={20}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `$${(x / 1000).toFixed(0)}k`}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 12, fill: '#666' }
            }}
          />
          <VictoryAxis
            tickFormat={(x, index) => chartData[index]?.label || ''}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 12, fill: '#666', angle: -45 }
            }}
          />
          <VictoryArea
            data={chartData}
            style={{
              data: { 
                fill: '#8884d8', 
                fillOpacity: 0.3,
                stroke: '#8884d8',
                strokeWidth: 2
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: '#8884d8', strokeWidth: 3 }
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: 'white', stroke: '#ccc' }}
                style={{ fontSize: 12 }}
                renderInPortal={false}
              />
            }
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default RevenueChart;