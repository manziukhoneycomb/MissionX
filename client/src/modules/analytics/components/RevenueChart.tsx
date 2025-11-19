import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  VictoryArea,
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryContainer,
  VictoryTheme,
} from 'victory';
import { RevenueTrend, ChartFilters } from '../types/analytics';
import { useRevenueTrends, useMonthlyRevenue, useQuarterlyRevenue } from '../analyticsQueries';

interface RevenueChartProps {
  data: RevenueTrend[];
  filters: ChartFilters;
  isLoading: boolean;
}

type ViewMode = 'trends' | 'monthly' | 'quarterly';

const RevenueChart: React.FC<RevenueChartProps> = ({ data: initialData, filters, isLoading }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('trends');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Query parameters from filters
  const queryParams = useMemo(() => {
    const params: any = {};
    if (filters.dateRange.startDate) {
      params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
    }
    if (filters.dateRange.endDate) {
      params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
    }
    if (filters.selectedTenantId) {
      params.tenantId = filters.selectedTenantId;
    }
    return params;
  }, [filters]);

  // Fetch data based on view mode
  const { data: trendsData } = useRevenueTrends(viewMode === 'trends' ? queryParams : undefined);
  const { data: monthlyData } = useMonthlyRevenue(viewMode === 'monthly' ? queryParams : undefined);
  const { data: quarterlyData } = useQuarterlyRevenue(viewMode === 'quarterly' ? queryParams : undefined);

  // Get the appropriate data based on view mode
  const chartData = useMemo(() => {
    switch (viewMode) {
      case 'monthly':
        return monthlyData?.map(item => ({
          x: item.month,
          y: item.revenue,
          label: `${item.month}\nRevenue: $${item.revenue.toLocaleString()}\nInvoices: ${item.invoiceCount}`,
          invoiceCount: item.invoiceCount,
        })) || [];
      case 'quarterly':
        return quarterlyData?.map(item => ({
          x: item.quarter,
          y: item.revenue,
          label: `${item.quarter}\nRevenue: $${item.revenue.toLocaleString()}\nInvoices: ${item.invoiceCount}`,
          invoiceCount: item.invoiceCount,
        })) || [];
      case 'trends':
      default:
        return trendsData?.map(item => ({
          x: item.period,
          y: item.revenue,
          label: `${item.period}\nRevenue: $${item.revenue.toLocaleString()}\nInvoices: ${item.invoiceCount}\nAvg: $${item.averageValue.toLocaleString()}`,
          invoiceCount: item.invoiceCount,
          averageValue: item.averageValue,
        })) || [];
    }
  }, [viewMode, trendsData, monthlyData, quarterlyData]);

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      setViewMode(newMode);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleChartTypeChange = (type: 'area' | 'line') => {
    setChartType(type);
    handleMenuClose();
  };

  const handleExport = () => {
    // Simple CSV export
    const csvData = chartData.map(item => ({
      Period: item.x,
      Revenue: item.y,
      'Invoice Count': item.invoiceCount || 0,
      'Average Value': (item as any).averageValue || 0,
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    handleMenuClose();
  };

  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.y, 0);
  }, [chartData]);

  const totalInvoices = useMemo(() => {
    return chartData.reduce((sum, item) => sum + (item.invoiceCount || 0), 0);
  }, [chartData]);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Revenue Trends</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="trends">Trends</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="quarterly">Quarterly</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              <MenuItem onClick={() => handleChartTypeChange('area')}>Area Chart</MenuItem>
              <MenuItem onClick={() => handleChartTypeChange('line')}>Line Chart</MenuItem>
              <MenuItem onClick={handleExport}>Export CSV</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Summary Statistics */}
        <Box display="flex" gap={3} mb={3}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h6" color="primary">
              ${totalRevenue.toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Invoices
            </Typography>
            <Typography variant="h6">
              {totalInvoices.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 300, width: '100%' }}>
          {chartData.length > 0 ? (
            <VictoryChart
              theme={VictoryTheme.material}
              containerComponent={<VictoryContainer responsive={true} />}
              padding={{ left: 80, top: 20, right: 50, bottom: 80 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
                style={{
                  tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                  grid: { stroke: theme.palette.divider, strokeWidth: 1 },
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 12, fill: theme.palette.text.secondary, angle: -45 },
                  grid: { stroke: 'transparent' },
                }}
              />
              {chartType === 'area' ? (
                <VictoryArea
                  data={chartData}
                  interpolation="natural"
                  style={{
                    data: {
                      fill: theme.palette.primary.main,
                      fillOpacity: 0.3,
                      stroke: theme.palette.primary.main,
                      strokeWidth: 2,
                    },
                  }}
                  labelComponent={<VictoryTooltip />}
                />
              ) : (
                <VictoryLine
                  data={chartData}
                  interpolation="natural"
                  style={{
                    data: {
                      stroke: theme.palette.primary.main,
                      strokeWidth: 3,
                    },
                  }}
                  labelComponent={<VictoryTooltip />}
                />
              )}
            </VictoryChart>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              color="text.secondary"
            >
              {isLoading ? 'Loading chart data...' : 'No data available'}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;