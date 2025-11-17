import React, { useState } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
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
} from 'victory';
import { RevenueData, AnalyticsFilters } from '../types/analytics';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: RevenueData[];
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

type ChartType = 'line' | 'area';
type TimeRange = '7d' | '30d' | '90d' | '1y';

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('area');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('90d');
  const [zoomDomain, setZoomDomain] = useState<{ x: [Date, Date] } | null>(null);

  const handleChartTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ChartType | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newRange: TimeRange | null) => {
    if (newRange !== null) {
      setSelectedRange(newRange);
      const now = new Date();
      const start = new Date();
      
      switch (newRange) {
        case '7d':
          start.setDate(now.getDate() - 7);
          break;
        case '30d':
          start.setDate(now.getDate() - 30);
          break;
        case '90d':
          start.setDate(now.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(now.getFullYear() - 1);
          break;
      }

      onFiltersChange({
        ...filters,
        dateRange: {
          start: format(start, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd'),
        },
      });
    }
  };

  const formatTooltip = (datum: any) => {
    return [
      `Date: ${format(parseISO(datum.date), 'MMM dd, yyyy')}`,
      `Revenue: $${datum.revenue.toLocaleString()}`,
      `Invoices: ${datum.invoiceCount}`,
    ];
  };

  const processedData = data.map((d) => ({
    ...d,
    x: new Date(d.date),
    y: d.revenue,
  }));

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0;
  const totalInvoices = data.reduce((sum, d) => sum + d.invoiceCount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h6" color="primary">
                ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Avg Daily
              </Typography>
              <Typography variant="h6">
                ${Math.round(avgRevenue).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
              <Typography variant="h6" color="success.main">
                {totalInvoices.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={selectedRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="7d">7D</ToggleButton>
            <ToggleButton value="30d">30D</ToggleButton>
            <ToggleButton value="90d">90D</ToggleButton>
            <ToggleButton value="1y">1Y</ToggleButton>
          </ToggleButtonGroup>

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
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <VictoryChart
          height={400}
          width={800}
          containerComponent={
            <VictoryZoomContainer
              zoomDimension="x"
              zoomDomain={zoomDomain}
              onZoomDomainChange={(domain) => setZoomDomain(domain)}
            />
          }
          theme={{
            axis: {
              style: {
                tickLabels: {
                  fontSize: 12,
                  fill: theme.palette.text.secondary,
                },
                grid: {
                  stroke: theme.palette.divider,
                  strokeWidth: 1,
                },
              },
            },
          }}
          padding={{ left: 80, top: 20, right: 50, bottom: 60 }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `$${(x / 1000).toFixed(0)}k`}
            style={{
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
              grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
            }}
          />
          <VictoryAxis
            fixLabelOverlap={true}
            tickFormat={(x) => format(x, 'MMM dd')}
            style={{
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary, angle: -45 },
            }}
          />

          {chartType === 'area' ? (
            <VictoryArea
              data={processedData}
              x="x"
              y="y"
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
              labelComponent={<VictoryTooltip flyoutStyle={{ fill: "white" }} />}
            />
          ) : (
            <>
              <VictoryLine
                data={processedData}
                x="x"
                y="y"
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
              <VictoryScatter
                data={processedData}
                x="x"
                y="y"
                size={4}
                style={{
                  data: {
                    fill: theme.palette.primary.main,
                  },
                }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      fill: "white",
                      stroke: theme.palette.divider,
                      strokeWidth: 1,
                    }}
                    style={{
                      fill: theme.palette.text.primary,
                      fontSize: 12,
                    }}
                  />
                }
                labels={formatTooltip}
              />
            </>
          )}
        </VictoryChart>
      </Box>

      {data.length > 30 && (
        <Box sx={{ mt: 2, height: 80 }}>
          <VictoryChart
            height={80}
            width={800}
            padding={{ left: 80, top: 5, right: 50, bottom: 30 }}
            containerComponent={
              <VictoryBrushContainer
                brushDimension="x"
                brushDomain={zoomDomain}
                onBrushDomainChange={(domain) => setZoomDomain(domain)}
              />
            }
          >
            <VictoryAxis />
            <VictoryLine
              data={processedData}
              x="x"
              y="y"
              style={{
                data: {
                  stroke: theme.palette.primary.main,
                  strokeWidth: 1,
                },
              }}
            />
          </VictoryChart>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Click and drag to zoom in on the chart. Use the brush below for navigation.
        </Typography>
      </Box>
    </Box>
  );
};

export default RevenueChart;