import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
} from 'victory';
import { GetApp, ViewList, BarChart } from '@mui/icons-material';
import { useAnalyticsFilter } from '../contexts/AnalyticsContext';
import { useTenantPerformance } from '../analyticsQueries';
import { TenantMetric } from '../types/analytics';

type ViewMode = 'chart' | 'table';
type SortField = 'tenantName' | 'totalRevenue' | 'invoiceCount' | 'paymentSuccessRate';
type SortOrder = 'asc' | 'desc';

const TenantMetrics: React.FC = () => {
  const theme = useTheme();
  const { filter } = useAnalyticsFilter();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const query = {
    dateRange: {
      startDate: filter.startDate,
      endDate: filter.endDate,
    },
    tenantIds: filter.selectedTenants.length > 0 ? filter.selectedTenants : undefined,
  };

  const { data, isLoading, error } = useTenantPerformance(query);

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
        Failed to load tenant metrics data. Please try again.
      </Alert>
    );
  }

  if (!data || data.tenants.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No tenant data available for the selected period.
      </Alert>
    );
  }

  // Sort tenants
  const sortedTenants = [...data.tenants].sort((a, b) => {
    const aValue = a[sortField] as any;
    const bValue = b[sortField] as any;
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportData = () => {
    const csvData = data.tenants.map(tenant => ({
      'Tenant Name': tenant.tenantName || tenant.tenantId,
      'Total Revenue': tenant.totalRevenue,
      'Invoice Count': tenant.invoiceCount,
      'Average Invoice Value': tenant.averageInvoiceValue,
      'Paid Invoices': tenant.paidInvoices,
      'Unpaid Invoices': tenant.unpaidInvoices,
      'Overdue Invoices': tenant.overdueInvoices,
      'Payment Success Rate': `${tenant.paymentSuccessRate.toFixed(1)}%`,
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tenant-metrics.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data (top 10 tenants by revenue)
  const chartData = sortedTenants.slice(0, 10).map((tenant, index) => ({
    x: tenant.tenantName || `Tenant ${index + 1}`,
    y: tenant.totalRevenue,
    label: `${tenant.tenantName || tenant.tenantId}: $${tenant.totalRevenue.toLocaleString()}`,
  }));

  const renderChart = () => (
    <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={20}
      height={300}
      padding={{ left: 80, top: 20, right: 20, bottom: 80 }}
    >
      <VictoryAxis
        dependentAxis
        tickFormat={(value) => `$${(value / 1000).toFixed(0)}K`}
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
        data={chartData}
        style={{
          data: {
            fill: theme.palette.primary.main,
            stroke: theme.palette.primary.dark,
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

  const renderTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === 'tenantName'}
                direction={sortField === 'tenantName' ? sortOrder : 'desc'}
                onClick={() => handleSort('tenantName')}
              >
                Tenant
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'totalRevenue'}
                direction={sortField === 'totalRevenue' ? sortOrder : 'desc'}
                onClick={() => handleSort('totalRevenue')}
              >
                Revenue
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortField === 'invoiceCount'}
                direction={sortField === 'invoiceCount' ? sortOrder : 'desc'}
                onClick={() => handleSort('invoiceCount')}
              >
                Invoices
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Avg Value</TableCell>
            <TableCell align="center">
              <TableSortLabel
                active={sortField === 'paymentSuccessRate'}
                direction={sortField === 'paymentSuccessRate' ? sortOrder : 'desc'}
                onClick={() => handleSort('paymentSuccessRate')}
              >
                Success Rate
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTenants.map((tenant) => (
            <TableRow key={tenant.tenantId} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {tenant.tenantName || tenant.tenantId}
                </Typography>
              </TableCell>
              <TableCell align="right">
                ${tenant.totalRevenue.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                {tenant.invoiceCount}
              </TableCell>
              <TableCell align="right">
                ${tenant.averageInvoiceValue.toLocaleString()}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={`${tenant.paymentSuccessRate.toFixed(1)}%`}
                  size="small"
                  color={
                    tenant.paymentSuccessRate >= 90 
                      ? 'success' 
                      : tenant.paymentSuccessRate >= 70 
                      ? 'warning' 
                      : 'error'
                  }
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="caption" color="success.main">
                    {tenant.paidInvoices} paid
                  </Typography>
                  {tenant.unpaidInvoices > 0 && (
                    <Typography variant="caption" color="warning.main">
                      {tenant.unpaidInvoices} unpaid
                    </Typography>
                  )}
                  {tenant.overdueInvoices > 0 && (
                    <Typography variant="caption" color="error.main">
                      {tenant.overdueInvoices} overdue
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Chart View">
            <IconButton
              size="small"
              onClick={() => setViewMode('chart')}
              color={viewMode === 'chart' ? 'primary' : 'default'}
            >
              <BarChart />
            </IconButton>
          </Tooltip>
          <Tooltip title="Table View">
            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              color={viewMode === 'table' ? 'primary' : 'default'}
            >
              <ViewList />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {data.tenants.length} tenants
          </Typography>
          <Tooltip title="Export Data">
            <IconButton size="small" onClick={exportData}>
              <GetApp />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {viewMode === 'chart' ? renderChart() : renderTable()}
      </Box>
    </Box>
  );
};

export default TenantMetrics;