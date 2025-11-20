import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
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
  VictoryPie,
} from 'victory';
import { PaymentDistributionMetrics } from '../types/analytics';

interface PaymentDistributionProps {
  readonly data: PaymentDistributionMetrics;
}

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<'methods' | 'timeline'>('methods');

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: 'methods' | 'timeline' | null,
  ) => {
    if (newViewType) {
      setViewType(newViewType);
    }
  };

  const methodsData = data.paymentMethods.map((item) => ({
    x: item.method,
    y: item.count,
    label: `${item.method}\nCount: ${item.count}\nAmount: $${item.totalAmount.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
  }));

  const timelineData = data.paymentTimeline.map((item, index) => ({
    x: index + 1,
    y: item.totalAmount,
    label: `${new Date(item.date).toLocaleDateString()}\nPayments: ${item.paymentsReceived}\nAmount: $${item.totalAmount.toLocaleString()}`,
  }));

  const colorScale = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
  ];

  return (
    <Card
      sx={{
        height: '500px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <CardHeader
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Payment Analysis
            </Typography>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              size="small">
              <ToggleButton value="methods">Methods</ToggleButton>
              <ToggleButton value="timeline">Timeline</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            Average Payment Time: {data.averagePaymentTime} days
          </Typography>
        }
      />
      <CardContent sx={{ flex: 1, p: 1 }}>
        {viewType === 'methods' ? (
          <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
            <VictoryPie
              data={methodsData}
              theme={VictoryTheme.material}
              colorScale={colorScale}
              containerComponent={
                <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
              }
              innerRadius={60}
              padAngle={2}
              labelRadius={({ innerRadius }) => innerRadius as number + 80}
              style={{
                labels: { fontSize: 11, fill: theme.palette.text.primary },
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
              animate={{
                duration: 1000,
              }}
            />
          </Box>
        ) : (
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
              tickFormat={(tick) => {
                const item = data.paymentTimeline[tick - 1];
                return item ? new Date(item.date).toLocaleDateString().slice(-5) : '';
              }}
              style={{
                tickLabels: { fontSize: 10, fill: theme.palette.text.secondary, angle: -45 },
              }}
              fixLabelOverlap={true}
            />
            
            <VictoryArea
              data={timelineData}
              style={{
                data: {
                  fill: `${theme.palette.success.main}20`,
                  fillOpacity: 0.6,
                  stroke: theme.palette.success.main,
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            
            <VictoryLine
              data={timelineData}
              style={{
                data: { stroke: theme.palette.success.main, strokeWidth: 3 }
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
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDistribution;