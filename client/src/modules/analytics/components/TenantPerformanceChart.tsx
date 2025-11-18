import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip } from 'victory';
import { TenantPerformance } from '../types/analytics';

interface TenantPerformanceChartProps {
  data?: TenantPerformance[];
}

type MetricType = 'revenue' | 'invoiceCount' | 'averageValue';

const TenantPerformanceChart: React.FC<TenantPerformanceChartProps> = ({ data }) => {
  const [metricType, setMetricType] = useState<MetricType>('revenue');

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No tenant performance data available</Typography>
      </Box>
    );
  }

  const getChartData = () => {
    return data.map((tenant, index) => ({
      x: index + 1,
      y: metricType === 'revenue' 
        ? tenant.totalRevenue
        : metricType === 'invoiceCount'
        ? tenant.invoiceCount
        : tenant.averageInvoiceValue,
      label: tenant.tenantName,
    }));
  };

  const getYAxisFormat = () => {
    switch (metricType) {
      case 'revenue':
        return (x: number) => `$${(x / 1000).toFixed(0)}k`;
      case 'invoiceCount':
        return (x: number) => x.toString();
      case 'averageValue':
        return (x: number) => `$${(x / 1000).toFixed(1)}k`;
      default:
        return (x: number) => x.toString();
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'revenue':
        return 'Total Revenue';
      case 'invoiceCount':
        return 'Invoice Count';
      case 'averageValue':
        return 'Average Invoice Value';
      default:
        return '';
    }
  };

  const chartData = getChartData();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {getMetricLabel()} by Tenant
        </Typography>
        <ButtonGroup size="small">
          <Button 
            variant={metricType === 'revenue' ? 'contained' : 'outlined'}
            onClick={() => setMetricType('revenue')}
          >
            Revenue
          </Button>
          <Button 
            variant={metricType === 'invoiceCount' ? 'contained' : 'outlined'}
            onClick={() => setMetricType('invoiceCount')}
          >
            Count
          </Button>
          <Button 
            variant={metricType === 'averageValue' ? 'contained' : 'outlined'}
            onClick={() => setMetricType('averageValue')}
          >
            Avg Value
          </Button>
        </ButtonGroup>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={280}
          width={800}
          padding={{ left: 80, top: 20, right: 80, bottom: 100 }}
          domainPadding={20}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={getYAxisFormat()}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 12, fill: '#666' }
            }}
          />
          <VictoryAxis
            tickFormat={(x, index) => {
              const tenant = data[index];
              return tenant ? (tenant.tenantName.length > 10 ? tenant.tenantName.substring(0, 10) + '...' : tenant.tenantName) : '';
            }}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 11, fill: '#666', angle: -45 }
            }}
          />
          <VictoryBar
            data={chartData}
            style={{
              data: { 
                fill: '#2196f3',
                fillOpacity: 0.8
              }
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: 'white', stroke: '#ccc' }}
                style={{ fontSize: 12 }}
                renderInPortal={false}
              />
            }
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default TenantPerformanceChart;