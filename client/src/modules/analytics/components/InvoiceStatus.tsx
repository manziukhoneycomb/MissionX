import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryPie,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryBar,
  VictoryAxis,
} from 'victory';
import { InvoiceStatusDto, AnalyticsQueryDto } from '../types/analytics';
import { useInvoiceStatusMetrics } from '../analyticsQueries';

interface InvoiceStatusProps {
  data: InvoiceStatusDto;
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

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ data, query }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  const { data: statusMetrics, isLoading } = useInvoiceStatusMetrics(query);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return theme.palette.success.main;
      case 'unpaid':
        return theme.palette.warning.main;
      case 'overdue':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const pieChartData = data.statusBreakdown.map((item) => ({
    x: item.status,
    y: item.count,
    label: `${item.status}\n${item.count} (${item.percentage.toFixed(1)}%)`,
  }));

  const agingChartData = data.agingAnalysis.map((item, index) => ({
    x: index + 1,
    y: item.count,
    label: `${item.ageRange}\n${item.count} invoices\n${formatCurrency(item.totalAmount)}\nAvg: ${item.averageDaysOverdue} days`,
    ageRange: item.ageRange,
  }));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Typography>Loading invoice status data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total
              </Typography>
              <Typography variant="h4" component="div">
                {data.totalInvoices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="success.main" variant="body2" gutterBottom>
                Paid
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {data.paidCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="warning.main" variant="body2" gutterBottom>
                Unpaid
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {data.unpaidCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="error.main" variant="body2" gutterBottom>
                Overdue
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                {data.overdueCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Status Distribution" />
          <Tab label="Aging Analysis" />
          <Tab label="Detailed Breakdown" />
        </Tabs>
      </Box>

      {/* Status Distribution Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
          <VictoryPie
            data={pieChartData}
            width={400}
            height={300}
            colorScale={data.statusBreakdown.map(item => getStatusColor(item.status))}
            innerRadius={60}
            labelRadius={({ innerRadius }) => (innerRadius as number) + 80}
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
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          {data.statusBreakdown.map((item) => (
            <Chip
              key={item.status}
              label={`${item.status}: ${item.count}`}
              sx={{
                bgcolor: getStatusColor(item.status),
                color: 'white',
                '& .MuiChip-label': {
                  fontWeight: 'bold',
                },
              }}
            />
          ))}
        </Box>
      </TabPanel>

      {/* Aging Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ height: 300, mb: 3 }}>
          <VictoryChart
            theme={VictoryTheme.material}
            height={280}
            domainPadding={20}
            containerComponent={<VictoryContainer responsive={true} />}
            padding={{ left: 60, right: 40, top: 20, bottom: 80 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => value.toString()}
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => {
                const item = agingChartData[x - 1];
                return item ? item.ageRange : '';
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
              data={agingChartData}
              style={{
                data: { fill: theme.palette.error.main },
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
        
        {/* Aging Summary */}
        <Grid container spacing={2}>
          {data.agingAnalysis.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.ageRange}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {item.ageRange}
                  </Typography>
                  <Typography variant="h4" color="error.main" gutterBottom>
                    {item.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(item.totalAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {item.averageDaysOverdue} days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Detailed Breakdown Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Percentage</TableCell>
                <TableCell align="right">Average Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.statusBreakdown.map((item) => (
                <TableRow key={item.status}>
                  <TableCell component="th" scope="row">
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(item.status),
                        color: 'white',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell align="right">{item.percentage.toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.count > 0 ? item.totalAmount / item.count : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Aging Analysis Table */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Aging Analysis Details
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Age Range</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Average Days Overdue</TableCell>
                <TableCell align="right">Percentage of Overdue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.agingAnalysis.map((item) => (
                <TableRow key={item.ageRange}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {item.ageRange}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell align="right">{item.averageDaysOverdue} days</TableCell>
                  <TableCell align="right">
                    {data.overdueCount > 0 ? ((item.count / data.overdueCount) * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {`Data based on ${data.totalInvoices} total invoices as of ${query.endDate || 'today'}`}
      </Typography>
    </Box>
  );
};

export default InvoiceStatus;