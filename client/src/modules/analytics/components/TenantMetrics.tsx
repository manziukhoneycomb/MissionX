import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
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
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
} from 'victory';
import { MoreVert as MoreVertIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useTenantMetrics } from '../analyticsQueries';
import { DateRangeFilter, TenantMetric } from '../services/analyticsService';

interface TenantMetricsProps {
  filters?: DateRangeFilter;
}

type SortField = 'tenantName' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type SortOrder = 'asc' | 'desc';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ filters }) => {
  const [viewType, setViewType] = useState<'table' | 'chart'>('table');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data, isLoading, error } = useTenantMetrics(filters);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    if (data?.data) {
      const csvData = data.data.map(tenant => ({
        'Tenant Name': tenant.tenantName,
        'Invoice Count': tenant.invoiceCount,
        'Total Revenue': tenant.totalRevenue,
        'Average Invoice Value': tenant.averageInvoiceValue,
        'Payment Timeliness': `${tenant.paymentTimeliness}%`,
      }));
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tenant-metrics.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load tenant metrics. Please try again later.
      </Alert>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="body1" color="textSecondary">
          No tenant data available for the selected period.
        </Typography>
      </Box>
    );
  }

  // Sort the data
  const sortedData = [...data.data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  // Prepare chart data (top 10 tenants by revenue)
  const chartData = sortedData
    .slice(0, 10)
    .map((tenant, index) => ({
      x: index + 1,
      y: tenant.totalRevenue,
      label: `${tenant.tenantName}: $${tenant.totalRevenue.toLocaleString()}`,
      tenantName: tenant.tenantName.length > 15 
        ? `${tenant.tenantName.substring(0, 15)}...` 
        : tenant.tenantName,
    }));

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ButtonGroup size="small">
          <Button
            variant={viewType === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewType('table')}
          >
            Table
          </Button>
          <Button
            variant={viewType === 'chart' ? 'contained' : 'outlined'}
            onClick={() => setViewType('chart')}
          >
            Chart
          </Button>
        </ButtonGroup>

        <IconButton onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleExport}>
            Export Data (CSV)
          </MenuItem>
        </Menu>
      </Box>

      {viewType === 'table' ? (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
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
                    active={sortField === 'invoiceCount'}
                    direction={sortField === 'invoiceCount' ? sortOrder : 'desc'}
                    onClick={() => handleSort('invoiceCount')}
                  >
                    Invoices
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
                    active={sortField === 'averageInvoiceValue'}
                    direction={sortField === 'averageInvoiceValue' ? sortOrder : 'desc'}
                    onClick={() => handleSort('averageInvoiceValue')}
                  >
                    Avg Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'paymentTimeliness'}
                    direction={sortField === 'paymentTimeliness' ? sortOrder : 'desc'}
                    onClick={() => handleSort('paymentTimeliness')}
                  >
                    Timeliness
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((tenant) => (
                <TableRow key={tenant.tenantId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {tenant.tenantName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {tenant.invoiceCount}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${tenant.totalRevenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${tenant.averageInvoiceValue.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Chip
                        size="small"
                        label={`${tenant.paymentTimeliness}%`}
                        color={tenant.paymentTimeliness >= 80 ? 'success' : 
                               tenant.paymentTimeliness >= 60 ? 'warning' : 'error'}
                        icon={tenant.paymentTimeliness >= 80 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ width: '100%', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Top 10 Tenants by Revenue
          </Typography>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={20}
            width={600}
            height={350}
            padding={{ left: 100, right: 60, top: 20, bottom: 80 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${(t / 1000)}K`}
              style={{
                tickLabels: { fontSize: 12 },
                grid: { stroke: "#e0e0e0" }
              }}
            />
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 10, angle: -45 },
              }}
              tickFormat={(x) => chartData[x - 1]?.tenantName || ''}
            />
            <VictoryBar
              data={chartData}
              x="x"
              y="y"
              style={{
                data: { 
                  fill: (datum: any) => {
                    const index = datum.x - 1;
                    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'];
                    return colors[index % colors.length];
                  }
                }
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              labelComponent={<VictoryTooltip />}
            />
          </VictoryChart>
        </Box>
      )}
    </Box>
  );
};

export default TenantMetrics;