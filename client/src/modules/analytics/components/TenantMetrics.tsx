import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  ButtonGroup,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
} from 'victory';
import { TenantAnalytics, TenantMetricPoint } from '../types/analytics';

interface TenantMetricsProps {
  data?: TenantAnalytics;
}

type ViewMode = 'chart' | 'table';
type SortField = 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type SortDirection = 'asc' | 'desc';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tenant Performance
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">No tenant data available</Typography>
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

  const sortedTenants = [...data.tenantMetrics].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (aValue - bValue) * multiplier;
  });

  const topTenants = sortedTenants.slice(0, 10);

  const chartData = topTenants.map((tenant, index) => ({
    x: index + 1,
    y: tenant.totalRevenue,
    label: `${tenant.tenantName}\nRevenue: ${formatCurrency(tenant.totalRevenue)}\nInvoices: ${tenant.invoiceCount}`,
    tenant,
  }));

  const handleTenantClick = (tenant: TenantMetricPoint) => {
    console.log('Navigate to tenant details:', tenant.tenantId);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Tenant Performance
          </Typography>
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={viewMode === 'chart' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </ButtonGroup>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
          <Chip
            label={`Total Tenants: ${data.totalTenants}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Avg Invoices/Tenant: ${data.avgInvoicesPerTenant.toFixed(1)}`}
            color="secondary"
            variant="outlined"
          />
        </Stack>

        {viewMode === 'chart' ? (
          <Box sx={{ height: 350, width: '100%' }}>
            <VictoryChart
              theme={VictoryTheme.material}
              height={350}
              width={600}
              padding={{ left: 60, top: 20, right: 40, bottom: 100 }}
              domainPadding={20}
            >
              <VictoryAxis
                dependentAxis
                tickFormat={(value) => formatCurrency(value)}
                style={{
                  tickLabels: { fontSize: 11, padding: 5 },
                  grid: { stroke: "#e0e0e0" },
                }}
              />
              <VictoryAxis
                tickFormat={(x, i) => {
                  const tenant = topTenants[x - 1];
                  return tenant ? tenant.tenantName.substring(0, 10) + (tenant.tenantName.length > 10 ? '...' : '') : '';
                }}
                style={{
                  tickLabels: { fontSize: 10, padding: 5, angle: -45 },
                }}
              />
              
              <VictoryBar
                data={chartData}
                style={{
                  data: { fill: "#1976d2" }
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
                        handleTenantClick(topTenants[props.index]);
                        return null;
                      }
                    })
                  }
                }]}
              />
            </VictoryChart>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tenant Name</TableCell>
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
                      active={sortField === 'averageInvoiceValue'}
                      direction={sortField === 'averageInvoiceValue' ? sortDirection : 'asc'}
                      onClick={() => handleSort('averageInvoiceValue')}
                    >
                      Avg Invoice
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortField === 'paymentTimeliness'}
                      direction={sortField === 'paymentTimeliness' ? sortDirection : 'asc'}
                      onClick={() => handleSort('paymentTimeliness')}
                    >
                      On-Time %
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTenants.map((tenant) => (
                  <TableRow
                    key={tenant.tenantId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleTenantClick(tenant)}
                  >
                    <TableCell component="th" scope="row">
                      {tenant.tenantName}
                    </TableCell>
                    <TableCell align="right">{tenant.invoiceCount}</TableCell>
                    <TableCell align="right">{formatCurrency(tenant.totalRevenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(tenant.averageInvoiceValue)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${tenant.paymentTimeliness.toFixed(1)}%`}
                        size="small"
                        color={tenant.paymentTimeliness >= 90 ? 'success' : tenant.paymentTimeliness >= 70 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Top Performing Tenants
          </Typography>
          <Stack spacing={1}>
            {data.topPerformingTenants.slice(0, 3).map((tenant, index) => (
              <Box key={tenant.tenantId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  {index + 1}. {tenant.tenantName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`${tenant.paymentTimeliness.toFixed(0)}%`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(tenant.totalRevenue)}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TenantMetrics;