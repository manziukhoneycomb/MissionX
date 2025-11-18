import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryLegend,
} from 'victory';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useRevenueTrends } from '../analyticsQueries';
import { DateRangeFilter } from '../services/analyticsService';

interface RevenueChartProps {
  period: 'monthly' | 'quarterly';
  filters?: DateRangeFilter;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ period, filters }) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showInvoiceCount, setShowInvoiceCount] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data, isLoading, error } = useRevenueTrends(period, filters);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChartTypeChange = (type: 'line' | 'area') => {
    setChartType(type);
    handleMenuClose();
  };

  const handleExport = () => {
    // Implementation for exporting chart data
    const csvData = data?.data.map(item => ({
      Period: item.period,
      Revenue: item.revenue,
      'Invoice Count': item.invoiceCount,
    }));
    
    if (csvData) {
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-trends-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load revenue data. Please try again later.
      </Alert>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="body1" color="textSecondary">
          No revenue data available for the selected period.
        </Typography>
      </Box>
    );
  }

  const revenueData = data.data.map((item, index) => ({
    x: index + 1,
    y: item.revenue,
    label: `${item.period}: $${item.revenue.toLocaleString()}`,
    period: item.period,
  }));

  const invoiceCountData = data.data.map((item, index) => ({
    x: index + 1,
    y: item.invoiceCount,
    label: `${item.period}: ${item.invoiceCount} invoices`,
    period: item.period,
  }));

  const maxRevenue = Math.max(...revenueData.map(d => d.y));
  const maxInvoiceCount = Math.max(...invoiceCountData.map(d => d.y));

  return (
    <Box>
      {/* Chart Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={chartType === 'line' ? 'contained' : 'outlined'}
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            size="small"
            variant={chartType === 'area' ? 'contained' : 'outlined'}
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
        </Box>

        <IconButton onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => setShowInvoiceCount(!showInvoiceCount)}>
            {showInvoiceCount ? 'Hide' : 'Show'} Invoice Count
          </MenuItem>
          <MenuItem onClick={handleExport}>
            Export Data (CSV)
          </MenuItem>
        </Menu>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 400 }}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={600}
          height={400}
          containerComponent={<VictoryZoomContainer zoomDimension="x" />}
          padding={{ left: 80, right: showInvoiceCount ? 80 : 60, top: 20, bottom: 60 }}
        >
          {/* Legend */}
          <VictoryLegend
            x={120}
            y={10}
            orientation="horizontal"
            gutter={20}
            style={{ border: { stroke: "black" } }}
            data={[
              { name: "Revenue ($)", symbol: { fill: "#1976d2", type: "square" } },
              ...(showInvoiceCount ? [{ name: "Invoice Count", symbol: { fill: "#dc004e", type: "square" } }] : [])
            ]}
          />

          {/* Left Y-axis for Revenue */}
          <VictoryAxis
            dependentAxis
            orientation="left"
            style={{
              tickLabels: { fontSize: 12 },
              grid: { stroke: "#e0e0e0" }
            }}
            tickFormat={(t) => `$${(t / 1000)}K`}
          />

          {/* Right Y-axis for Invoice Count */}
          {showInvoiceCount && (
            <VictoryAxis
              dependentAxis
              orientation="right"
              style={{
                tickLabels: { fontSize: 12 },
              }}
              domain={[0, maxInvoiceCount * 1.1]}
              tickFormat={(t) => `${t}`}
            />
          )}

          {/* X-axis */}
          <VictoryAxis
            style={{
              tickLabels: { fontSize: 12, angle: -45 },
            }}
            tickFormat={() => ''}
            fixLabelOverlap={true}
          />

          {/* Revenue Chart */}
          {chartType === 'area' ? (
            <VictoryArea
              data={revenueData}
              style={{
                data: { 
                  fill: "#1976d2", 
                  fillOpacity: 0.6, 
                  stroke: "#1976d2", 
                  strokeWidth: 2 
                }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              labelComponent={<VictoryTooltip />}
            />
          ) : (
            <VictoryLine
              data={revenueData}
              style={{
                data: { stroke: "#1976d2", strokeWidth: 3 }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              labelComponent={<VictoryTooltip />}
            />
          )}

          {/* Invoice Count Line */}
          {showInvoiceCount && (
            <VictoryLine
              data={invoiceCountData.map(d => ({
                ...d,
                y: (d.y / maxInvoiceCount) * maxRevenue
              }))}
              style={{
                data: { stroke: "#dc004e", strokeWidth: 2, strokeDasharray: "5,5" }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              labelComponent={<VictoryTooltip />}
            />
          )}
        </VictoryChart>
      </Box>

      {/* Period Labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 2 }}>
        {data.data.map((item, index) => (
          <Typography key={index} variant="caption" sx={{ transform: 'rotate(-45deg)', fontSize: '0.75rem' }}>
            {item.period}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default RevenueChart;