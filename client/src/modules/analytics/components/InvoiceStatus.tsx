import React from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  VictoryChart,
  VictoryPie,
  VictoryTheme,
  VictoryTooltip,
  VictoryContainer,
  VictoryLegend,
} from 'victory';
import { useInvoiceStatusOverview } from '../analyticsQueries';
import { DateRange, InvoiceStatus } from '../types/analytics';

interface InvoiceStatusProps {
  dateRange: DateRange;
  refreshKey?: number;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ dateRange, refreshKey = 0 }) => {
  const {
    data: statusData,
    isLoading,
    error,
  } = useInvoiceStatusOverview(dateRange, true);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load invoice status data: {error.message}
      </Alert>
    );
  }

  if (!statusData || !statusData.overview) {
    return (
      <Alert severity="info">
        No invoice status data available for the selected date range.
      </Alert>
    );
  }

  const { overview } = statusData;
  const { statusBreakdown, agingAnalysis, totalInvoices, totalValue } = overview;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return '#4caf50';
      case InvoiceStatus.PENDING:
        return '#ff9800';
      case InvoiceStatus.OVERDUE:
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.PENDING:
        return 'Pending';
      case InvoiceStatus.OVERDUE:
        return 'Overdue';
      default:
        return status;
    }
  };

  const pieData = statusBreakdown.map((item) => ({
    x: getStatusLabel(item.status),
    y: item.count,
    percentage: item.percentage,
    value: item.totalValue,
  }));

  const agingData = agingAnalysis.map((bucket) => ({
    x: bucket.bucket,
    y: bucket.count,
    value: bucket.totalValue,
  }));

  return (
    <Box>
      <Stack spacing={3}>
        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Total Invoices
                </Typography>
                <Typography variant="h6" color="primary">
                  {totalInvoices.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(totalValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Distribution Pie Chart */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Status Distribution
          </Typography>
          <Box sx={{ width: '100%', height: 280 }}>
            <VictoryChart
              theme={VictoryTheme.material}
              height={280}
              width={400}
              padding={{ left: 50, top: 20, right: 50, bottom: 60 }}
              containerComponent={<VictoryContainer responsive />}
            >
              <VictoryPie
                data={pieData}
                colorScale={statusBreakdown.map(item => getStatusColor(item.status))}
                innerRadius={50}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{ 
                      fill: "white", 
                      stroke: "#333", 
                      strokeWidth: 1 
                    }}
                    style={{ fontSize: 12, fill: "#333" }}
                    renderInPortal={false}
                  />
                }
                labels={({ datum }) => 
                  `${datum.x}\n${datum.y} invoices\n${formatCurrency(datum.value)}\n${datum.percentage.toFixed(1)}%`
                }
              />
              <VictoryLegend
                x={50} y={20}
                orientation="horizontal"
                gutter={20}
                style={{ border: { stroke: "none" }, title: { fontSize: 14 } }}
                data={statusBreakdown.map(item => ({
                  name: `${getStatusLabel(item.status)} (${item.count})`,
                  symbol: { fill: getStatusColor(item.status) }
                }))}
              />
            </VictoryChart>
          </Box>
        </Box>

        <Divider />

        {/* Aging Analysis */}
        {agingAnalysis.length > 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Aging Analysis (Overdue Invoices)
            </Typography>
            <Stack spacing={2}>
              {agingAnalysis.map((bucket, index) => {
                const percentage = totalInvoices > 0 ? (bucket.count / totalInvoices) * 100 : 0;
                return (
                  <Box
                    key={bucket.bucket}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      backgroundColor: index % 2 === 0 ? 'grey.50' : 'transparent',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {bucket.bucket}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {bucket.count} invoices ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
                      {formatCurrency(bucket.totalValue)}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Status Breakdown Details */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Status Details
          </Typography>
          <Stack spacing={1}>
            {statusBreakdown.map((status) => (
              <Box
                key={status.status}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderLeft: '4px solid',
                  borderLeftColor: getStatusColor(status.status),
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getStatusLabel(status.status)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {status.count} invoices ({status.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: getStatusColor(status.status)
                  }}
                >
                  {formatCurrency(status.totalValue)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default InvoiceStatus;