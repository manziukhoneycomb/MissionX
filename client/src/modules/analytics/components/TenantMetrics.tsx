import React, { useState } from 'react';
import {
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
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TableRows as TableIcon,
  Visibility as DetailsIcon,
} from '@mui/icons-material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryLabel,
} from 'victory';
import { TenantMetric, AnalyticsFilters } from '../types/analytics';

interface TenantMetricsProps {
  data: TenantMetric[];
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

type ViewMode = 'chart' | 'table';
type SortField = 'tenantName' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type SortOrder = 'asc' | 'desc';

const TenantMetrics: React.FC<TenantMetricsProps> = ({
  data,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleTenantClick = (tenantId: string) => {
    const currentTenantIds = filters.tenantIds || [];
    const newTenantIds = currentTenantIds.includes(tenantId)
      ? currentTenantIds.filter(id => id !== tenantId)
      : [...currentTenantIds, tenantId];
    
    onFiltersChange({
      ...filters,
      tenantIds: newTenantIds.length > 0 ? newTenantIds : undefined,
    });
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal: number | string = a[sortField];
    let bVal: number | string = b[sortField];
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const chartData = sortedData.slice(0, 10).map((tenant, index) => ({
    ...tenant,
    x: tenant.tenantName.length > 15 
      ? `${tenant.tenantName.slice(0, 12)}...` 
      : tenant.tenantName,
    y: tenant.totalRevenue,
    index,
  }));

  const getPaymentTimelinessColor = (timeliness: number) => {
    if (timeliness >= 90) return theme.palette.success.main;
    if (timeliness >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPaymentTimelinessLabel = (timeliness: number) => {
    if (timeliness >= 90) return 'Excellent';
    if (timeliness >= 70) return 'Good';
    return 'Needs Attention';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Tenants
              </Typography>
              <Typography variant="h6" color="primary">
                {data.length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Tenants
              </Typography>
              <Typography variant="h6" color="success.main">
                {data.filter(t => t.invoiceCount > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="chart">
            <BarChartIcon />
          </ToggleButton>
          <ToggleButton value="table">
            <TableIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'chart' ? (
        <Box sx={{ height: 400, width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom>
            Top 10 Tenants by Revenue
          </Typography>
          <VictoryChart
            height={400}
            width={800}
            domainPadding={{ x: 20 }}
            padding={{ left: 100, top: 20, right: 50, bottom: 120 }}
            theme={{
              axis: {
                style: {
                  tickLabels: {
                    fontSize: 11,
                    fill: theme.palette.text.secondary,
                  },
                  grid: {
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  },
                },
              },
            }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(x) => `$${(x / 1000).toFixed(0)}k`}
              style={{
                tickLabels: { fontSize: 11, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
              }}
            />
            <VictoryAxis
              style={{
                tickLabels: { 
                  fontSize: 11, 
                  fill: theme.palette.text.secondary, 
                  angle: -45 
                },
              }}
            />
            
            <VictoryBar
              data={chartData}
              x="x"
              y="y"
              style={{
                data: {
                  fill: ({ datum }) => 
                    filters.tenantIds?.includes(datum.tenantId) 
                      ? theme.palette.secondary.main 
                      : theme.palette.primary.main,
                  stroke: theme.palette.primary.dark,
                  strokeWidth: 1,
                  cursor: 'pointer',
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              events={[{
                target: 'data',
                eventHandlers: {
                  onClick: () => ({
                    target: 'data',
                    mutation: ({ datum }) => {
                      handleTenantClick(datum.tenantId);
                      return null;
                    }
                  })
                }
              }]}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: "white",
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  }}
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                  }}
                />
              }
              labels={({ datum }) => [
                `${datum.tenantName}`,
                `Revenue: $${datum.totalRevenue.toLocaleString()}`,
                `Invoices: ${datum.invoiceCount}`,
                `Avg: $${datum.averageInvoiceValue.toLocaleString()}`,
                `Timeliness: ${datum.paymentTimeliness}%`
              ]}
            />
          </VictoryChart>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'tenantName'}
                    direction={sortField === 'tenantName' ? sortOrder : 'asc'}
                    onClick={() => handleSort('tenantName')}
                  >
                    Tenant Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'invoiceCount'}
                    direction={sortField === 'invoiceCount' ? sortOrder : 'asc'}
                    onClick={() => handleSort('invoiceCount')}
                  >
                    Invoices
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'totalRevenue'}
                    direction={sortField === 'totalRevenue' ? sortOrder : 'asc'}
                    onClick={() => handleSort('totalRevenue')}
                  >
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'averageInvoiceValue'}
                    direction={sortField === 'averageInvoiceValue' ? sortOrder : 'asc'}
                    onClick={() => handleSort('averageInvoiceValue')}
                  >
                    Avg Invoice
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'paymentTimeliness'}
                    direction={sortField === 'paymentTimeliness' ? sortOrder : 'asc'}
                    onClick={() => handleSort('paymentTimeliness')}
                  >
                    Payment Timeliness
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((tenant) => (
                <TableRow 
                  key={tenant.tenantId}
                  sx={{ 
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                    backgroundColor: filters.tenantIds?.includes(tenant.tenantId) 
                      ? theme.palette.action.selected 
                      : 'inherit'
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {tenant.tenantName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={tenant.invoiceCount} 
                      size="small" 
                      color={tenant.invoiceCount > 10 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${tenant.totalRevenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${tenant.averageInvoiceValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${tenant.paymentTimeliness}% - ${getPaymentTimelinessLabel(tenant.paymentTimeliness)}`}
                      size="small"
                      style={{
                        backgroundColor: getPaymentTimelinessColor(tenant.paymentTimeliness),
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleTenantClick(tenant.tenantId)}
                      color={filters.tenantIds?.includes(tenant.tenantId) ? 'primary' : 'default'}
                    >
                      <DetailsIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Click on bars or use the details button to filter by specific tenants. 
          {filters.tenantIds && filters.tenantIds.length > 0 && (
            <span> Currently filtering by {filters.tenantIds.length} tenant(s).</span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default TenantMetrics;