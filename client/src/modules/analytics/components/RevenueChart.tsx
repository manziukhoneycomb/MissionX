import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryLabel,
} from 'victory';
import { RevenueTrendDto, AnalyticsQueryDto } from '../types/analytics';
import { useRevenueMetrics } from '../analyticsQueries';

interface RevenueChartProps {
  data: RevenueTrendDto[];
  query: AnalyticsQueryDto;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, query }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [zoom, setZoom] = useState(1);
  
  const { data: revenueMetrics, isLoading } = useRevenueMetrics(query);

  const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
    setChartType(event.target.value as 'line' | 'area');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(query.period === 'daily' ? {} : { year: '2-digit' })
    });
  };

  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: item.revenue,
    label: `${formatDate(item.date)}\nRevenue: ${formatCurrency(item.revenue)}\nInvoices: ${item.invoiceCount}`,
    date: item.date,
    invoiceCount: item.invoiceCount,
  }));

  const ChartComponent = chartType === 'area' ? VictoryArea : VictoryLine;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Typography>Loading revenue data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      {revenueMetrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  {formatCurrency(revenueMetrics.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Average Invoice Value
                </Typography>
                <Typography variant="h5" component="div">
                  {formatCurrency(revenueMetrics.averageInvoiceValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Growth Rate
                </Typography>
                <Typography 
                  variant="h5" 
                  component="div"
                  color={revenueMetrics.growthPercentage >= 0 ? 'success.main' : 'error.main'}
                >
                  {revenueMetrics.growthPercentage >= 0 ? '+' : ''}
                  {revenueMetrics.growthPercentage.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary" gutterBottom>
                  Total Invoices
                </Typography>
                <Typography variant="h5" component="div">
                  {data.reduce((sum, item) => sum + item.invoiceCount, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Chart Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Chart Type</InputLabel>
          <Select value={chartType} onChange={handleChartTypeChange} label="Chart Type">
            <MenuItem value="area">Area Chart</MenuItem>
            <MenuItem value="line">Line Chart</MenuItem>
          </Select>
        </FormControl>
        
        <Box>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} disabled={zoom >= 2}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 400, overflow: 'hidden' }}>
        <VictoryChart
          theme={VictoryTheme.material}
          height={350}
          width={800 * zoom}
          containerComponent={<VictoryContainer responsive={false} />}
          padding={{ left: 80, right: 40, top: 40, bottom: 60 }}
          style={{
            parent: { 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => formatCurrency(value)}
            style={{
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
              grid: { stroke: theme.palette.divider },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => {
              const item = chartData[x - 1];
              return item ? formatDate(item.date) : '';
            }}
            style={{
              tickLabels: { 
                fontSize: 12, 
                fill: theme.palette.text.secondary,
                angle: -45,
                textAnchor: 'end',
              },
              grid: { stroke: 'transparent' },
            }}
          />
          <ChartComponent
            data={chartData}
            style={{
              data: { 
                fill: chartType === 'area' ? theme.palette.primary.main : 'transparent',
                fillOpacity: chartType === 'area' ? 0.3 : 1,
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
                  fill: theme.palette.text.primary,
                  fontSize: 12,
                }}
                flyoutStyle={{
                  fill: theme.palette.background.paper,
                  stroke: theme.palette.divider,
                  strokeWidth: 1,
                }}
              />
            }
          />
        </VictoryChart>
      </Box>

      {/* Chart Info */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {`Showing revenue trends over ${data.length} ${query.period || 'monthly'} periods`}
      </Typography>
    </Box>
  );
};

export default RevenueChart;