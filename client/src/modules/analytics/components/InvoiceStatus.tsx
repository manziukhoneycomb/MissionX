import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  VictoryChart,
  VictoryPie,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryLegend,
  VictoryContainer,
} from 'victory';
import { GetApp } from '@mui/icons-material';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import { useInvoiceStatusOverview } from '../analyticsQueries';

type TabValue = 'status' | 'aging';

const InvoiceStatus: React.FC = () => {
  const theme = useTheme();
  const { filter } = useAnalyticsFilter();
  const [activeTab, setActiveTab] = useState<TabValue>('status');

  const query = {
    dateRange: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    tenantIds: filter.selectedTenants.length > 0 ? filter.selectedTenants : undefined,
  };

  const { data, isLoading, error } = useInvoiceStatusOverview(query);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load invoice status data. Please try again.
      </Alert>
    );
  }

  if (!data || data.statusCounts.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No invoice status data available for the selected period.
      </Alert>
    );
  }

  const exportData = () => {
    const csvData = [
      ...data.statusCounts.map(status => ({
        Type: 'Status',
        Category: status.status,
        Count: status.count,
        Amount: status.totalAmount,
        Percentage: status.percentage,
      })),
      ...data.agingAnalysis.map(aging => ({
        Type: 'Aging',
        Category: aging.ageRange,
        Count: aging.count,
        Amount: aging.totalAmount,
        Percentage: aging.percentage,
      })),
    ];
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-status.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Color palette for status
  const statusColors = {
    'Paid': theme.palette.success.main,
    'Unpaid': theme.palette.warning.main,
    'Overdue': theme.palette.error.main,
  };

  // Color palette for aging
  const agingColors = [
    theme.palette.info.main,
    theme.palette.warning.light,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const statusPieData = data.statusCounts.map((status) => ({
    x: status.status,
    y: status.count,
    label: `${status.status}\n${status.count} (${status.percentage.toFixed(1)}%)`,
  }));

  const agingBarData = data.agingAnalysis.map((aging) => ({
    x: aging.ageRange,
    y: aging.count,
    label: `${aging.ageRange}: ${aging.count} invoices`,
  }));

  const renderStatusChart = () => (
    <Box sx={{ height: 300 }}>
      <VictoryPie
        data={statusPieData}
        theme={VictoryTheme.material}
        colorScale={data.statusCounts.map(status => statusColors[status.status] || theme.palette.grey[500])}
        labelComponent={<VictoryTooltip />}
        padAngle={2}
        innerRadius={60}
        animate={{
          duration: 1000,
        }}
        labelRadius={({ innerRadius }) => innerRadius + 40 }
        style={{
          labels: { fontSize: 12, fill: theme.palette.text.primary },
        }}
      />
    </Box>
  );

  const renderAgingChart = () => (
    <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={20}
      height={300}
      padding={{ left: 60, top: 20, right: 20, bottom: 80 }}
    >
      <VictoryAxis
        dependentAxis
        tickFormat={(value) => value.toString()}
        style={{
          tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
          axis: { stroke: theme.palette.divider },
          grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
        }}
      />
      <VictoryAxis
        style={{
          tickLabels: { 
            fontSize: 10, 
            fill: theme.palette.text.secondary,
            angle: -45,
          },
          axis: { stroke: theme.palette.divider },
        }}
      />
      <VictoryBar
        data={agingBarData}
        style={{
          data: {
            fill: ({ index }) => agingColors[index % agingColors.length],
            stroke: theme.palette.background.paper,
            strokeWidth: 1,
          },
        }}
        labelComponent={<VictoryTooltip />}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
      />
    </VictoryChart>
  );

  const renderSummaryStats = () => (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={6}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="h6" color="primary">
            {data.totalInvoices}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Invoices
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
          <Typography 
            variant="h6" 
            color={data.collectionRate >= 80 ? 'success.main' : 'warning.main'}
          >
            {data.collectionRate.toFixed(1)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Collection Rate
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="h6" color="success.main">
            ${data.paidAmount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paid Amount
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="h6" color="warning.main">
            ${data.unpaidAmount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unpaid Amount
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, value) => setActiveTab(value)}
          size="small"
        >
          <Tab label="Status" value="status" />
          <Tab label="Aging" value="aging" />
        </Tabs>
        
        <Tooltip title="Export Data">
          <IconButton size="small" onClick={exportData}>
            <GetApp />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Stats */}
      {renderSummaryStats()}

      {/* Charts */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'status' ? renderStatusChart() : renderAgingChart()}
      </Box>

      {/* Legend for Status Chart */}
      {activeTab === 'status' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          {data.statusCounts.map((status) => (
            <Box key={status.status} sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: statusColors[status.status] || theme.palette.grey[500],
                  mr: 0.5,
                }}
              />
              <Typography variant="caption">
                {status.status} ({status.count})
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default InvoiceStatus;