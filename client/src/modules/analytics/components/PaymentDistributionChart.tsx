import React from 'react';
import { Box, Typography } from '@mui/material';
import { VictoryPie, VictoryTheme, VictoryTooltip, VictoryContainer } from 'victory';
import { PaymentDistribution } from '../types/analytics';

interface PaymentDistributionChartProps {
  data?: PaymentDistribution;
}

const PaymentDistributionChart: React.FC<PaymentDistributionChartProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No payment data available</Typography>
      </Box>
    );
  }

  const total = data.paid + data.unpaid + data.overdue;
  if (total === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No payment data available</Typography>
      </Box>
    );
  }

  const chartData = [
    { 
      x: 'Paid', 
      y: data.paid, 
      percentage: ((data.paid / total) * 100).toFixed(1),
      color: '#4caf50'
    },
    { 
      x: 'Unpaid', 
      y: data.unpaid, 
      percentage: ((data.unpaid / total) * 100).toFixed(1),
      color: '#ff9800'
    },
    { 
      x: 'Overdue', 
      y: data.overdue, 
      percentage: ((data.overdue / total) * 100).toFixed(1),
      color: '#f44336'
    },
  ].filter(item => item.y > 0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <VictoryPie
          data={chartData}
          x="x"
          y="y"
          theme={VictoryTheme.material}
          height={300}
          width={300}
          innerRadius={60}
          padAngle={3}
          colorScale={chartData.map(item => item.color)}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: 'white', stroke: '#ccc' }}
              style={{ fontSize: 12, fill: '#333' }}
              renderInPortal={false}
            />
          }
          labelRadius={({ innerRadius }) => innerRadius as number + 40}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 }
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
        {chartData.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {item.x}: {item.y} ({item.percentage}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PaymentDistributionChart;