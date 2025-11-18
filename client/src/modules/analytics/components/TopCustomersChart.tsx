import React from 'react';
import { Box, Typography } from '@mui/material';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip } from 'victory';
import { TopCustomer } from '../types/analytics';

interface TopCustomersChartProps {
  data?: TopCustomer[];
}

const TopCustomersChart: React.FC<TopCustomersChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No customer data available</Typography>
      </Box>
    );
  }

  const chartData = data.slice(0, 8).map((customer, index) => ({
    x: index + 1,
    y: customer.totalRevenue,
    label: customer.customerName,
    invoiceCount: customer.invoiceCount,
  }));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Top {data.length > 8 ? '8' : data.length} Customers by Revenue
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={280}
          width={500}
          padding={{ left: 80, top: 20, right: 80, bottom: 120 }}
          domainPadding={15}
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
            tickFormat={(x, index) => {
              const customer = data[index];
              if (!customer) return '';
              const name = customer.customerName;
              return name.length > 12 ? name.substring(0, 12) + '...' : name;
            }}
            style={{
              axis: { stroke: '#ccc' },
              ticks: { stroke: '#ccc' },
              tickLabels: { fontSize: 10, fill: '#666', angle: -45 }
            }}
          />
          <VictoryBar
            data={chartData}
            style={{
              data: { 
                fill: '#9c27b0',
                fillOpacity: 0.8
              }
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: 'white', stroke: '#ccc' }}
                style={{ fontSize: 12 }}
                renderInPortal={false}
                text={({ datum }) => [
                  `Customer: ${datum.label}`,
                  `Revenue: $${datum.y.toLocaleString()}`,
                  `Invoices: ${datum.invoiceCount}`
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
    </Box>
  );
};

export default TopCustomersChart;