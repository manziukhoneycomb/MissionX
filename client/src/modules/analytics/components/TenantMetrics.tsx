import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryContainer,
  VictoryTheme,
} from 'victory';
import { TenantMetrics as TenantMetricsType, ChartFilters } from '../types/analytics';

interface TenantMetricsProps {
  data: TenantMetricsType[];
  filters: ChartFilters;
  isLoading: boolean;
}

type SortField = 'tenantName' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'overdueCount';
type SortDirection = 'asc' | 'desc';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data, filters, isLoading }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Sort data
  const sortedData = useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Chart data (top 10 tenants by revenue)
  const chartData = useMemo(() => {
    return sortedData
      .slice(0, 10)
      .map(tenant => ({
        x: tenant.tenantName.length > 15 
          ? `${tenant.tenantName.substring(0, 15)}...`
          : tenant.tenantName,
        y: tenant.totalRevenue,
        label: `${tenant.tenantName}\nRevenue: $${tenant.totalRevenue.toLocaleString()}\nInvoices: ${tenant.invoiceCount}`,
        overdueCount: tenant.overdueCount,
      }));
  }, [sortedData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleViewToggle = (mode: 'table' | 'chart') => {
    setViewMode(mode);
    handleMenuClose();
  };

  const handleExport = () => {
    const csvData = sortedData.map(tenant => ({
      'Tenant Name': tenant.tenantName,
      'Invoice Count': tenant.invoiceCount,
      'Total Revenue': tenant.totalRevenue,
      'Average Invoice Value': tenant.averageInvoiceValue,
      'Overdue Count': tenant.overdueCount,
      'Average Payment Days': tenant.averagePaymentDays || 'N/A',
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    handleMenuClose();
  };

  const getOverdueStatus = (overdueCount: number, totalCount: number) => {
    const percentage = totalCount > 0 ? (overdueCount / totalCount) * 100 : 0;
    if (percentage === 0) return { color: 'success' as const, label: 'Good' };
    if (percentage <= 10) return { color: 'warning' as const, label: 'Watch' };
    return { color: 'error' as const, label: 'Alert' };
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Tenant Performance Metrics</Typography>
          </Box>
          <Alert severity="info">
            No tenant metrics data available for the selected period.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Tenant Performance Metrics</Typography>
          </Box>
          <Box>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              <MenuItem onClick={() => handleViewToggle('table')}>Table View</MenuItem>
              <MenuItem onClick={() => handleViewToggle('chart')}>Chart View</MenuItem>
              <MenuItem onClick={handleExport}>Export CSV</MenuItem>
            </Menu>
          </Box>
        </Box>

        {viewMode === 'chart' ? (
          <Box sx={{ height: 400, width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Top 10 Tenants by Revenue
            </Typography>
            <VictoryChart
              theme={VictoryTheme.material}
              containerComponent={<VictoryContainer responsive={true} />}
              domainPadding={{ x: 40 }}
              padding={{ left: 80, top: 20, right: 50, bottom: 120 }}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
                style={{
                  tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                  grid: { stroke: theme.palette.divider, strokeWidth: 1 },
                }}
              />
              <VictoryAxis
                style={{
                  tickLabels: { fontSize: 10, fill: theme.palette.text.secondary, angle: -45 },
                  grid: { stroke: 'transparent' },
                }}
              />
              <VictoryBar
                data={chartData}
                style={{
                  data: {
                    fill: ({ datum }) => datum.overdueCount > 0 
                      ? theme.palette.warning.main 
                      : theme.palette.primary.main,
                  },
                }}
                labelComponent={<VictoryTooltip />}
              />
            </VictoryChart>
          </Box>
        ) : (
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
                      Tenant Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortField === 'invoiceCount'}
                      direction={sortField === 'invoiceCount' ? sortDirection : 'desc'}
                      onClick={() => handleSort('invoiceCount')}
                    >
                      Invoices
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortField === 'totalRevenue'}
                      direction={sortField === 'totalRevenue' ? sortDirection : 'desc'}
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Total Revenue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortField === 'averageInvoiceValue'}
                      direction={sortField === 'averageInvoiceValue' ? sortDirection : 'desc'}
                      onClick={() => handleSort('averageInvoiceValue')}
                    >
                      Avg Invoice
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortField === 'overdueCount'}
                      direction={sortField === 'overdueCount' ? sortDirection : 'desc'}
                      onClick={() => handleSort('overdueCount')}
                    >
                      Overdue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((tenant) => {
                  const overdueStatus = getOverdueStatus(tenant.overdueCount, tenant.invoiceCount);
                  return (
                    <TableRow key={tenant.tenantId} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {tenant.tenantName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {tenant.invoiceCount.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2" fontWeight="medium">
                            ${tenant.totalRevenue.toLocaleString()}
                          </Typography>
                          {tenant.totalRevenue > 50000 ? (
                            <TrendingUpIcon color="success" fontSize="small" sx={{ ml: 0.5 }} />
                          ) : (
                            <TrendingDownIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${tenant.averageInvoiceValue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2"
                          color={tenant.overdueCount > 0 ? 'error' : 'text.primary'}
                        >
                          {tenant.overdueCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={overdueStatus.label}
                          color={overdueStatus.color}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Summary Statistics */}
        <Box display="flex" gap={3} mt={2} pt={2} borderTop={1} borderColor="divider">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Tenants
            </Typography>
            <Typography variant="h6">
              {data.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h6" color="primary">
              ${data.reduce((sum, tenant) => sum + tenant.totalRevenue, 0).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Overdue
            </Typography>
            <Typography variant="h6" color="error">
              {data.reduce((sum, tenant) => sum + tenant.overdueCount, 0)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TenantMetrics;