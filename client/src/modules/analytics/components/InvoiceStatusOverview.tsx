import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  VictoryChart,
  VictoryPie,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryLegend,
} from 'victory';
import { InvoiceStatusAnalytics } from '../types/analytics';

interface InvoiceStatusOverviewProps {
  data?: InvoiceStatusAnalytics;
}

type ViewMode = 'status' | 'aging';

const InvoiceStatusOverview: React.FC<InvoiceStatusOverviewProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('status');

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Invoice Status Overview
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">No invoice status data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statusColors = {
    paid: '#4caf50',
    unpaid: '#ff9800',
    overdue: '#f44336',
  };

  const pieData = data.statusDistribution.map((status) => ({
    x: status.status.charAt(0).toUpperCase() + status.status.slice(1),
    y: status.count,
    amount: status.totalAmount,
    percentage: status.percentage,
  }));

  const agingData = data.agingAnalysis.map((bucket, index) => ({
    x: index + 1,
    y: bucket.count,
    label: `${bucket.range}\n${bucket.count} invoices\n${formatCurrency(bucket.totalAmount)}`,
    range: bucket.range,
  }));

  const handleStatusClick = (status: string) => {
    console.log('Navigate to invoices with status:', status.toLowerCase());
  };

  const handleAgingClick = (range: string) => {
    console.log('Navigate to invoices in aging range:', range);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Invoice Status Overview
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={viewMode === 'status' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('status')}
            >
              Status
            </Button>
            <Button
              size="small"
              variant={viewMode === 'aging' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('aging')}
            >
              Aging
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <Chip
            label={`Total Invoices: ${data.totalInvoices}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Overdue Amount: ${formatCurrency(data.overdueAmount)}`}
            color="error"
            variant="outlined"
          />
        </Stack>

        {viewMode === 'status' ? (
          <Box>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
              <VictoryPie
                data={pieData}
                width={300}
                height={250}
                innerRadius={60}
                padAngle={2}
                colorScale={data.statusDistribution.map(status => statusColors[status.status])}
                labelComponent={<VictoryTooltip />}
                animate={{ duration: 1000 }}
                events={[{
                  target: "data",
                  eventHandlers: {
                    onClick: () => ({
                      target: "data",
                      mutation: (props) => {
                        const status = pieData[props.index].x;
                        handleStatusClick(status);
                        return null;
                      }
                    })
                  }
                }]}
              />
            </Box>

            <List dense>
              {data.statusDistribution.map((status, index) => (
                <React.Fragment key={status.status}>
                  <ListItem
                    button
                    onClick={() => handleStatusClick(status.status)}
                    sx={{ px: 0 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: statusColors[status.status],
                        borderRadius: '50%',
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {status.status}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${status.percentage.toFixed(1)}%`}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {status.count} ({formatCurrency(status.totalAmount)})
                            </Typography>
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < data.statusDistribution.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        ) : (
          <Box>
            <Box sx={{ height: 250, width: '100%' }}>
              <VictoryChart
                theme={VictoryTheme.material}
                height={250}
                width={500}
                padding={{ left: 60, top: 20, right: 40, bottom: 80 }}
                domainPadding={20}
              >
                <VictoryAxis
                  dependentAxis
                  tickFormat={(value) => `${value}`}
                  style={{
                    tickLabels: { fontSize: 11, padding: 5 },
                    grid: { stroke: "#e0e0e0" },
                  }}
                />
                <VictoryAxis
                  tickFormat={(x, i) => {
                    const bucket = data.agingAnalysis[x - 1];
                    return bucket ? bucket.range : '';
                  }}
                  style={{
                    tickLabels: { fontSize: 10, padding: 5, angle: -45 },
                  }}
                />
                
                <VictoryBar
                  data={agingData}
                  style={{
                    data: { fill: "#ff9800" }
                  }}
                  labelComponent={<VictoryTooltip />}
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: () => ({
                        target: "data",
                        mutation: (props) => {
                          const bucket = data.agingAnalysis[props.index];
                          handleAgingClick(bucket.range);
                          return null;
                        }
                      })
                    }
                  }]}
                />
              </VictoryChart>
            </Box>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
              Aging Breakdown
            </Typography>
            <List dense>
              {data.agingAnalysis.map((bucket, index) => (
                <React.Fragment key={bucket.range}>
                  <ListItem
                    button
                    onClick={() => handleAgingClick(bucket.range)}
                    sx={{ px: 0 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {bucket.range}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {bucket.count} ({formatCurrency(bucket.totalAmount)})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < data.agingAnalysis.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceStatusOverview;