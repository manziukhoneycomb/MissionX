import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ButtonGroup,
  Button,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryZoomContainer,
} from 'victory';
import { format, parseISO } from 'date-fns';
import { RevenueAnalytics } from '../types/analytics';

interface RevenueChartProps {
  data?: RevenueAnalytics;
}

type ViewMode = 'monthly' | 'quarterly';

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  
  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Trends
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">No revenue data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = viewMode === 'monthly' ? data.monthlyRevenue : data.quarterlyRevenue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return viewMode === 'monthly' ? format(date, 'MMM yyyy') : format(date, 'QQQ yyyy');
  };

  const processedData = chartData.map((point, index) => ({
    x: index + 1,
    y: point.revenue,
    label: `${formatDate(point.date)}\nRevenue: ${formatCurrency(point.revenue)}\nInvoices: ${point.invoiceCount}`,
    date: point.date,
  }));

  const handleDrillDown = (point: any) => {
    console.log('Drill down for period:', point.date);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Revenue Trends
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={viewMode === 'monthly' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={viewMode === 'quarterly' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('quarterly')}
            >
              Quarterly
            </Button>
          </ButtonGroup>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Chip
            label={`Total Revenue: ${formatCurrency(data.totalRevenue)}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Avg Invoice: ${formatCurrency(data.averageInvoiceValue)}`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={`Growth: ${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}%`}
            color={data.revenueGrowth >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
        </Stack>

        <Box sx={{ height: 300, width: '100%' }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={300}
            width={600}
            padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
            containerComponent={
              <VictoryZoomContainer
                zoomDimension="x"
                allowResize={false}
                allowPan={true}
              />
            }
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => formatCurrency(value)}
              style={{
                tickLabels: { fontSize: 11, padding: 5 },
                grid: { stroke: "#e0e0e0" },
              }}
            />
            <VictoryAxis
              tickFormat={(x, i) => {
                const point = chartData[x - 1];
                return point ? formatDate(point.date) : '';
              }}
              style={{
                tickLabels: { fontSize: 11, padding: 5, angle: -45 },
              }}
            />
            
            <VictoryArea
              data={processedData}
              style={{
                data: { fill: "#1976d2", fillOpacity: 0.1, stroke: "#1976d2", strokeWidth: 2 }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            
            <VictoryLine
              data={processedData}
              style={{
                data: { stroke: "#1976d2", strokeWidth: 3 }
              }}
              labelComponent={<VictoryTooltip />}
              events={[{
                target: "data",
                eventHandlers: {
                  onClick: () => ({
                    target: "data",
                    mutation: (props) => {
                      handleDrillDown(chartData[props.index]);
                      return null;
                    }
                  })
                }
              }]}
            />
          </VictoryChart>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Top Customers by Revenue
          </Typography>
          <Stack spacing={1}>
            {data.topCustomers.slice(0, 3).map((customer, index) => (
              <Box key={customer.customerName} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  {index + 1}. {customer.customerName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {customer.invoiceCount} invoices
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(customer.totalRevenue)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;