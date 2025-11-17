import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  VictoryChart,
  VictoryPie,
  VictoryBar,
  VictoryLine,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryArea,
} from 'victory';
import { PaymentDistributionDto, AnalyticsQueryDto } from '../types/analytics';
import { usePaymentDistribution } from '../analyticsQueries';

interface PaymentDistributionProps {
  data: PaymentDistributionDto;
  query: AnalyticsQueryDto;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data, query }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  const { data: paymentMetrics, isLoading } = usePaymentDistribution(query);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChartTypeChange = (event: SelectChangeEvent<string>) => {
    setChartType(event.target.value as 'line' | 'area' | 'bar');
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

  const getMethodColor = (method: string, index: number) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    return colors[index % colors.length];
  };

  const pieChartData = data.byPaymentMethod.map((item) => ({
    x: item.method,
    y: item.count,
    label: `${item.method}\n${item.count} payments\n${formatCurrency(item.totalAmount)}\n${item.percentage.toFixed(1)}%`,
  }));

  const volumeChartData = data.paymentVolume.map((item, index) => ({
    x: index + 1,
    y: chartType === 'bar' ? item.paymentCount : item.totalAmount,
    label: `${formatDate(item.date)}\n${item.paymentCount} payments\n${formatCurrency(item.totalAmount)}`,
    date: item.date,
    paymentCount: item.paymentCount,
    totalAmount: item.totalAmount,
  }));

  const ChartComponent = chartType === 'area' ? VictoryArea : 
                       chartType === 'line' ? VictoryLine : VictoryBar;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Typography>Loading payment distribution data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h5" component="div">
                {data.totalPayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(data.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Average Payment
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(data.averagePaymentAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Most Popular Method
              </Typography>
              <Typography variant="h6" component="div">
                {data.byPaymentMethod.reduce((max, item) => 
                  item.count > max.count ? item : max
                ).method}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Payment Methods" />
          <Tab label="Volume Trends" />
          <Tab label="Method Comparison" />
        </Tabs>
      </Box>

      {/* Payment Methods Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
              <VictoryPie
                data={pieChartData}
                width={350}
                height={300}
                colorScale={data.byPaymentMethod.map((_, index) => getMethodColor('', index))}
                innerRadius={50}
                labelRadius={({ innerRadius }) => (innerRadius as number) + 70}
                animate={{
                  duration: 1000,
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
            </Box>
          </Grid>

          {/* Method Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, overflow: 'auto' }}>
              {data.byPaymentMethod.map((method, index) => (
                <Card key={method.method} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: getMethodColor('', index),
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="h6">{method.method}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Payments: {method.count}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Amount: {formatCurrency(method.totalAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Share: {method.percentage.toFixed(1)}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg: {formatCurrency(method.count > 0 ? method.totalAmount / method.count : 0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Volume Trends Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Chart Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Payment Volume Over Time</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select value={chartType} onChange={handleChartTypeChange} label="Chart Type">
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Volume Chart */}
        <Box sx={{ height: 350 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={320}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 80, right: 40, top: 40, bottom: 60 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => 
                chartType === 'bar' ? value.toString() : formatCurrency(value)
              }
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => {
                const item = volumeChartData[x - 1];
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
              data={volumeChartData}
              style={{
                data: { 
                  fill: chartType === 'area' ? theme.palette.primary.main : 
                        chartType === 'bar' ? theme.palette.primary.main : 'transparent',
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
      </TabPanel>

      {/* Method Comparison Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Payment Method Comparison
        </Typography>
        
        {/* Comparison Bar Chart */}
        <Box sx={{ height: 300 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={280}
            domainPadding={20}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 100, right: 40, top: 20, bottom: 80 }}
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
                const item = data.byPaymentMethod[x - 1];
                return item ? item.method : '';
              }}
              style={{
                tickLabels: { 
                  fontSize: 11, 
                  fill: theme.palette.text.secondary,
                  angle: -45,
                  textAnchor: 'end',
                },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryBar
              data={data.byPaymentMethod.map((item, index) => ({
                x: index + 1,
                y: item.totalAmount,
                label: `${item.method}\n${formatCurrency(item.totalAmount)}\n${item.count} payments`,
              }))}
              style={{
                data: { fill: ({ index }) => getMethodColor('', index) },
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

        {/* Method Rankings */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {data.byPaymentMethod
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map((method, index) => (
              <Grid item xs={12} sm={6} md={4} key={method.method}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h4" color="primary" sx={{ mr: 1 }}>
                        #{index + 1}
                      </Typography>
                      <Typography variant="h6">{method.method}</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {formatCurrency(method.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.count} payments ({method.percentage.toFixed(1)}%)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {`Payment data showing ${data.paymentVolume.length} ${query.period || 'monthly'} periods`}
      </Typography>
    </Box>
  );
};

export default PaymentDistribution;