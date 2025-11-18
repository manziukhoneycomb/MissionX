import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryArea,
  VictoryZoomContainer,
} from 'victory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';
import { RevenueMetric } from '../types/analytics';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: RevenueMetric[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showArea, setShowArea] = useState(true);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'png' | 'csv') => {
    if (format === 'csv') {
      const csvData = data.map(item => ({
        Period: item.period,
        Revenue: item.revenue,
        'Invoice Count': item.invoiceCount,
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'revenue-chart.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  const formatPeriod = (period: string) => {
    try {
      if (period.includes('-')) {
        if (period.length === 7) {
          // YYYY-MM format
          return format(parseISO(`${period}-01`), 'MMM yyyy');
        } else {
          // YYYY-MM-DD format
          return format(parseISO(period), 'MMM dd');
        }
      }
      return period;
    } catch {
      return period;
    }
  };

  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.revenue,
    period: item.period,
    count: item.invoiceCount,
  }));

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No revenue data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Revenue Trends</Typography>
        <Box>
          <Tooltip title="Toggle area chart">
            <IconButton size="small" onClick={() => setShowArea(!showArea)}>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleExport('csv')}>Export CSV</MenuItem>
        <MenuItem onClick={() => handleExport('png')}>Export PNG</MenuItem>
      </Menu>

      <Box sx={{ height: 320 }}>
        <VictoryChart
          containerComponent={<VictoryZoomContainer />}
          theme={{
            axis: {
              style: {
                axis: { stroke: theme.palette.divider },
                tickLabels: { fill: theme.palette.text.secondary, fontSize: 12 },
                grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
              },
            },
          }}
          padding={{ left: 80, right: 40, top: 20, bottom: 60 }}
          height={320}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
            style={{
              grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
            }}
          />
          <VictoryAxis
            tickFormat={(_, index) => formatPeriod(data[index]?.period || '')}
            style={{
              tickLabels: { angle: -45, textAnchor: 'end' },
            }}
          />
          
          {showArea && (
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: theme.palette.primary.main,
                  fillOpacity: 0.2,
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
          )}
          
          <VictoryLine
            data={chartData}
            style={{
              data: {
                stroke: theme.palette.primary.main,
                strokeWidth: 2,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
          
          <VictoryTooltip
            renderInPortal={false}
            flyoutStyle={{
              stroke: theme.palette.divider,
              fill: theme.palette.background.paper,
            }}
            pointerLength={0}
            cornerRadius={4}
            flyoutPadding={8}
            labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 12 }} />}
            datum={(datum: any) => `${formatPeriod(datum.period)}\n$${datum.y.toLocaleString()}\n${datum.count} invoices`}
          />
        </VictoryChart>
      </Box>
    </Paper>
  );
};

export default RevenueChart;