import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryContainer,
} from 'victory';
import { Info as InfoIcon } from '@mui/icons-material';
import { useTenantMetrics } from '../analyticsQueries';
import { DateRange, TenantPerformance } from '../types/analytics';

interface TenantMetricsProps {
  dateRange: DateRange;
  refreshKey?: number;
}

type SortField = 'tenantName' | 'totalRevenue' | 'invoiceCount' | 'avgInvoiceValue' | 'paymentTimeliness';
type SortDirection = 'asc' | 'desc';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ dateRange, refreshKey = 0 }) => {
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const {
    data: tenantData,
    isLoading,
    error,
  } = useTenantMetrics(
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 10,
    },
    true
  );

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
        Failed to load tenant metrics: {error.message}
      </Alert>
    );
  }

  if (!tenantData || !tenantData.tenants || tenantData.tenants.length === 0) {
    return (
      <Alert severity="info">
        No tenant data available for the selected date range.
      </Alert>
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTenants = [...tenantData.tenants].sort((a, b) => {
    let aValue: number | string = a[sortField];
    let bValue: number | string = b[sortField];
    
    if (sortField === 'tenantName') {
      aValue = (a.tenantName || 'Unknown').toLowerCase();
      bValue = (b.tenantName || 'Unknown').toLowerCase();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const chartData = sortedTenants.slice(0, 5).map((tenant, index) => ({
    x: index + 1,
    y: tenant.totalRevenue,
    label: tenant.tenantName || 'Unknown',
  }));

  const getTimelinessColor = (timeliness: number) => {
    if (timeliness >= 90) return 'success';
    if (timeliness >= 70) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Bar Chart - Top 5 Tenants by Revenue */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Top Tenants by Revenue
          </Typography>
          <Box sx={{ width: '100%', height: 250 }}>
            <VictoryChart
              theme={VictoryTheme.material}
              height={250}
              width={400}
              padding={{ left: 100, top: 20, right: 50, bottom: 80 }}
              domainPadding={20}
              containerComponent={<VictoryContainer responsive />}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(value) => formatCurrency(value)}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 },
                  grid: { stroke: "#e0e0e0" }
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10, padding: 5, angle: -45 },
                }}
                tickFormat={(x) => {
                  const item = chartData[x - 1];
                  return item ? (item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label) : '';
                }}
              />
              <VictoryBar
                data={chartData}
                style={{
                  data: { fill: "#1976d2" }
                }}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{ 
                      fill: "white", 
                      stroke: "#1976d2", 
                      strokeWidth: 1 
                    }}
                    style={{ fontSize: 12, fill: "#333" }}
                    renderInPortal={false}
                  />
                }
                labels={({ datum }) => 
                  `${datum.label}\n${formatCurrency(datum.y)}`
                }
              />
            </VictoryChart>
          </Box>
        </Box>

        {/* Detailed Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'tenantName'}
                    direction={sortField === 'tenantName' ? sortDirection : 'asc'}
                    onClick={() => handleSort('tenantName')}
                  >
                    Tenant
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'invoiceCount'}
                    direction={sortField === 'invoiceCount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('invoiceCount')}
                  >
                    Invoices
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'totalRevenue'}
                    direction={sortField === 'totalRevenue' ? sortDirection : 'asc'}
                    onClick={() => handleSort('totalRevenue')}
                  >
                    Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'avgInvoiceValue'}
                    direction={sortField === 'avgInvoiceValue' ? sortDirection : 'asc'}
                    onClick={() => handleSort('avgInvoiceValue')}
                  >
                    Avg Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TableSortLabel
                      active={sortField === 'paymentTimeliness'}
                      direction={sortField === 'paymentTimeliness' ? sortDirection : 'asc'}
                      onClick={() => handleSort('paymentTimeliness')}
                    >
                      Payment Score
                    </TableSortLabel>
                    <Tooltip title="Percentage of invoices paid on time">
                      <IconButton size="small" sx={{ ml: 0.5 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTenants.map((tenant) => (
                <TableRow
                  key={tenant.tenantId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {tenant.tenantName || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P: {tenant.paidInvoices} | Pending: {tenant.pendingInvoices} | Overdue: {tenant.overdueInvoices}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {tenant.invoiceCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {formatCurrency(tenant.totalRevenue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(tenant.avgInvoiceValue)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={formatPercentage(tenant.paymentTimeliness)}
                      color={getTimelinessColor(tenant.paymentTimeliness)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  );
};

export default TenantMetrics;