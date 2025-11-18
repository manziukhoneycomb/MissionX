import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryTheme,
  VictoryLabel,
} from 'victory';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useRevenueData } from '../analyticsQueries';
import { useAnalyticsFilters } from './AnalyticsPage';

type ChartType = 'line' | 'area';

const RevenueChart: React.FC = () => {
  const theme = useTheme();
  const { filters } = useAnalyticsFilters();
  const [chartType, setChartType] = useState<ChartType>('area');
  
  const { data: revenueData, isLoading, error } = useRevenueData(filters);

  const handleChartTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ChartType | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load revenue data
      </Alert>
    );
  }

  if (!revenueData || revenueData.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No revenue data available for the selected period
      </Alert>
    );
  }

  const chartData = revenueData.map((item) => ({
    x: new Date(item.date),
    y: item.revenue,
    invoiceCount: item.invoiceCount,
  }));

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalInvoices = revenueData.reduce((sum, item) => sum + item.invoiceCount, 0);
  const averageRevenue = totalRevenue / revenueData.length;

  const chartTheme = {
    ...VictoryTheme.material,
    axis: {
      ...VictoryTheme.material.axis,
      style: {
        ...VictoryTheme.material.axis.style,
        tickLabels: {
          ...VictoryTheme.material.axis.style.tickLabels,
          fill: theme.palette.text.primary,
        },
        axis: {
          ...VictoryTheme.material.axis.style.axis,
          stroke: theme.palette.divider,
        },
        grid: {
          ...VictoryTheme.material.axis.style.grid,
          stroke: theme.palette.divider,
        },
      },
    },
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                ${totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {totalInvoices.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                ${averageRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Click and drag to zoom, double-click to reset
        </Typography>
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

      <Box sx={{ width: '100%', height: 400 }}>
        <VictoryChart
          theme={chartTheme}
          width={800}
          height={400}
          padding={{ left: 70, top: 20, right: 40, bottom: 50 }}
          containerComponent={
            <VictoryZoomContainer
              responsive={true}
              zoomDimension="x"
            />
          }
        >
          <VictoryAxis dependentAxis tickFormat={(t) => `$${t / 1000}k`} />
          <VictoryAxis
            tickFormat={(x) => format(new Date(x), 'MMM dd')}
            tickCount={6}
          />
          
          {chartType === 'area' ? (
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: theme.palette.primary.main,
                  fillOpacity: 0.3,
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                  style={{ fill: theme.palette.text.primary }}
                  renderInPortal={false}
                />
              }
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
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                  style={{ fill: theme.palette.text.primary }}
                  renderInPortal={false}
                />
              }
            />
          )}
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default RevenueChart;