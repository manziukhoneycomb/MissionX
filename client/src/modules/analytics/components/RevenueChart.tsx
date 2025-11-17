import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
  VictoryClipContainer,
} from 'victory';
import {
  Box,
  ButtonGroup,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { RevenueMetric } from '../services/analyticsService';

interface RevenueChartProps {
  data: RevenueMetric[];
  period: 'monthly' | 'quarterly';
}

type ChartType = 'line' | 'area';

const RevenueChart: React.FC<RevenueChartProps> = ({ data, period }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('area');
  const [zoomDomain, setZoomDomain] = useState<{ x: [number, number] } | undefined>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.revenue,
    label: `${item.month}: $${item.revenue.toLocaleString()}`,
    month: item.month,
    count: item.invoiceCount,
  }));

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (format === 'csv') {
      const csvData = data
        .map(item => `${item.month},${item.revenue},${item.invoiceCount}`)
        .join('\n');
      const blob = new Blob([`Period,Revenue,Invoice Count\n${csvData}`], {
        type: 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-data-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const svgElement = document.querySelector('.revenue-chart svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        if (format === 'svg') {
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `revenue-chart-${period}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'png') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `revenue-chart-${period}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
            });
          };
          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }
      }
    }
    setAnchorEl(null);
  };

  const customTheme = {
    ...VictoryTheme.material,
    axis: {
      ...VictoryTheme.material.axis,
      style: {
        ...VictoryTheme.material.axis?.style,
        tickLabels: {
          ...VictoryTheme.material.axis?.style?.tickLabels,
          fill: theme.palette.text.secondary,
          fontSize: 12,
        },
        grid: {
          ...VictoryTheme.material.axis?.style?.grid,
          stroke: alpha(theme.palette.divider, 0.3),
        },
      },
    },
  };

  const resetZoom = () => {
    setZoomDomain(undefined);
  };

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
        bgcolor={alpha(theme.palette.grey[100], 0.1)}
        borderRadius={1}
      >
        No revenue data available
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={chartType === 'line' ? 'contained' : 'outlined'}
            onClick={() => setChartType('line')}
          >
            Line
          </Button>
          <Button
            variant={chartType === 'area' ? 'contained' : 'outlined'}
            onClick={() => setChartType('area')}
          >
            Area
          </Button>
        </ButtonGroup>

        <Box>
          {zoomDomain && (
            <Tooltip title="Reset Zoom">
              <IconButton size="small" onClick={resetZoom}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Export Chart">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box className="revenue-chart" height="400px">
        <VictoryChart
          theme={customTheme}
          height={400}
          width={800}
          containerComponent={
            <VictoryZoomContainer
              zoomDomain={zoomDomain}
              onZoomDomainChange={(domain) => setZoomDomain(domain)}
            />
          }
          padding={{ left: 80, top: 20, right: 50, bottom: 50 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `$${(t / 1000).toFixed(0)}k`}
            style={{
              tickLabels: { angle: 0 },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => data[x - 1]?.month.slice(0, 3) || ''}
            fixLabelOverlap={true}
          />

          {chartType === 'area' ? (
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: alpha(theme.palette.primary.main, 0.3),
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
                  style={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
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
                  style={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                />
              }
            />
          )}
        </VictoryChart>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('png')}>Export as PNG</MenuItem>
        <MenuItem onClick={() => handleExport('svg')}>Export as SVG</MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>Export Data as CSV</MenuItem>
      </Menu>
    </Box>
  );
};

export default RevenueChart;