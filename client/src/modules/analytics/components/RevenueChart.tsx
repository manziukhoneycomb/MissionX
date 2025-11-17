import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryScatter,
  VictoryTheme,
} from 'victory';
import { GetApp, ZoomIn, Refresh } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import { useRevenueTrends } from '../analyticsQueries';
import { ChartDataPoint } from '../types/analytics';

type ChartType = 'line' | 'area';
type TimeRange = 'daily' | 'weekly' | 'monthly';

const RevenueChart: React.FC = () => {
  const theme = useTheme();
  const { filter } = useAnalyticsFilter();
  const [chartType, setChartType] = useState<ChartType>('area');
  const [zoomDomain, setZoomDomain] = useState<any>();

  const query = {
    dateRange: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    tenantIds: filter.selectedTenants.length > 0 ? filter.selectedTenants : undefined,
  };

  const { data, isLoading, error, refetch } = useRevenueTrends(query);

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
        Failed to load revenue trends data. Please try again.
      </Alert>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No revenue data available for the selected period.
      </Alert>
    );
  }

  // Transform data for Victory charts
  const chartData: ChartDataPoint[] = data.data.map((point, index) => ({
    x: index + 1,
    y: point.revenue,
    label: `${point.period}: $${point.revenue.toLocaleString()}`,
    period: point.period,
    invoiceCount: point.invoiceCount,
  }));

  const handleZoom = (domain: any) => {
    setZoomDomain(domain);
  };

  const resetZoom = () => {
    setZoomDomain(undefined);
  };

  const exportChart = () => {
    // In a real implementation, this would export the chart as PNG/PDF
    const csvData = data.data.map(point => ({
      Period: point.period,
      Revenue: point.revenue,
      'Invoice Count': point.invoiceCount,
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenue-trends.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const customTooltip = ({ datum }: any) => {
    if (!datum) return null;
    return (
      <Box sx={{ 
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        boxShadow: 2
      }}>
        <Typography variant="body2" fontWeight="bold">
          {datum.period}
        </Typography>
        <Typography variant="body2">
          Revenue: ${datum.y.toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Invoices: {datum.invoiceCount}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      {/* Chart Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
            >
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary">
            Total: ${data.totalRevenue.toLocaleString()} | 
            Avg/Period: ${data.averageRevenuePerPeriod.toLocaleString()}
          </Typography>
        </Box>

        <Box>
          <Tooltip title="Reset Zoom">
            <IconButton size="small" onClick={resetZoom}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton size="small" onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton size="small" onClick={exportChart}>
              <GetApp />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Chart */}
      <VictoryChart
        theme={VictoryTheme.material}
        height={350}
        padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
        containerComponent={
          <VictoryZoomContainer
            zoomDimension="x"
            zoomDomain={zoomDomain}
            onZoomDomainChange={handleZoom}
          />
        }
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(value) => `$${(value / 1000).toFixed(0)}K`}
          style={{
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            axis: { stroke: theme.palette.divider },
            grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
          }}
        />
        <VictoryAxis
          tickFormat={(x) => {
            const point = data.data[x - 1];
            return point ? format(parseISO(point.date), 'MMM') : '';
          }}
          style={{
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            axis: { stroke: theme.palette.divider },
          }}
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
          />
        )}

        <VictoryScatter
          data={chartData}
          size={4}
          style={{
            data: {
              fill: theme.palette.primary.main,
              stroke: theme.palette.background.paper,
              strokeWidth: 2,
            },
          }}
          labelComponent={<VictoryTooltip flyoutComponent={customTooltip as any} />}
        />
      </VictoryChart>

      {/* Brush Chart for Navigation */}
      <VictoryChart
        theme={VictoryTheme.material}
        height={100}
        padding={{ left: 80, top: 10, right: 40, bottom: 30 }}
        containerComponent={
          <VictoryBrushContainer
            brushDimension="x"
            brushDomain={zoomDomain}
            onBrushDomainChange={handleZoom}
            brushStyle={{ fill: theme.palette.primary.main, fillOpacity: 0.2 }}
          />
        }
      >
        <VictoryAxis />
        <VictoryLine
          data={chartData}
          style={{
            data: {
              stroke: theme.palette.primary.main,
              strokeWidth: 2,
            },
          }}
        />
      </VictoryChart>
    </Box>
  );
};

export default RevenueChart;