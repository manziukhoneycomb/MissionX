import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
} from 'victory';
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
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import { useTenantMetrics } from '../analyticsQueries';
import { useAnalyticsFilters } from './AnalyticsPage';
import { TenantMetrics as TenantMetricsType } from '../services/analyticsService';

type SortField = 'tenantName' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'chart' | 'table';

const TenantMetrics: React.FC = () => {
  const theme = useTheme();
  const { filters } = useAnalyticsFilters();
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  
  const { data: tenantData, isLoading, error } = useTenantMetrics(filters);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleTenantClick = (tenantId: string) => {
    // TODO: Navigate to filtered invoice list or tenant details
    console.log('Clicked tenant:', tenantId);
  };

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
        Failed to load tenant metrics
      </Alert>
    );
  }

  if (!tenantData || tenantData.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No tenant data available for the selected period
      </Alert>
    );
  }

  const sortedData = [...tenantData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const chartData = sortedData.slice(0, 10).map((tenant) => ({
    x: tenant.tenantName,
    y: tenant.totalRevenue,
    tenantId: tenant.tenantId,
    invoiceCount: tenant.invoiceCount,
    averageValue: tenant.averageInvoiceValue,
  }));

  const getTimelinessColor = (timeliness: number) => {
    if (timeliness >= 90) return theme.palette.success.main;
    if (timeliness >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const chartTheme = {
    ...VictoryTheme.material,
    axis: {
      ...VictoryTheme.material.axis,
      style: {
        ...VictoryTheme.material.axis.style,
        tickLabels: {
          ...VictoryTheme.material.axis.style.tickLabels,
          fill: theme.palette.text.primary,
          fontSize: 12,
        },
        axis: {
          ...VictoryTheme.material.axis.style.axis,
          stroke: theme.palette.divider,
        },
        grid: {
          ...VictoryTheme.material.axis.style.grid,
          stroke: theme.palette.divider,
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {tenantData.length} tenants total
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="chart">Chart</ToggleButton>
          <ToggleButton value="table">Table</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'chart' ? (
        <Box sx={{ width: '100%', height: 400 }}>
          <VictoryChart
            theme={chartTheme}
            domainPadding={{ x: 20 }}
            padding={{ left: 70, top: 20, right: 40, bottom: 80 }}
            width={600}
            height={400}
            containerComponent={<VictoryContainer responsive={true} />}
          >
            <VictoryAxis dependentAxis tickFormat={(t) => `$${t / 1000}k`} />
            <VictoryAxis
              tickFormat={(x) => x.length > 10 ? `${x.substring(0, 10)}...` : x}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end' }
              }}
            />
            
            <VictoryBar
              data={chartData}
              style={{
                data: { 
                  fill: theme.palette.primary.main,
                  cursor: 'pointer',
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onClick: (evt, data) => {
                      handleTenantClick(data.datum.tenantId);
                    },
                    onMouseOver: () => {
                      return [
                        {
                          target: 'data',
                          mutation: { style: { fill: theme.palette.primary.dark } }
                        }
                      ];
                    },
                    onMouseOut: () => {
                      return [
                        {
                          target: 'data',
                          mutation: () => null
                        }
                      ];
                    }
                  }
                }
              ]}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                  style={{ fill: theme.palette.text.primary }}
                  renderInPortal={false}
                />
              }
            />
          </VictoryChart>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
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
                    Total Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'averageInvoiceValue'}
                    direction={sortField === 'averageInvoiceValue' ? sortDirection : 'asc'}
                    onClick={() => handleSort('averageInvoiceValue')}
                  >
                    Avg. Invoice
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'paymentTimeliness'}
                    direction={sortField === 'paymentTimeliness' ? sortDirection : 'asc'}
                    onClick={() => handleSort('paymentTimeliness')}
                  >
                    Timeliness
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((tenant) => (
                <TableRow
                  key={tenant.tenantId}
                  hover
                  onClick={() => handleTenantClick(tenant.tenantId)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{tenant.tenantName}</TableCell>
                  <TableCell align="right">{tenant.invoiceCount}</TableCell>
                  <TableCell align="right">${tenant.totalRevenue.toLocaleString()}</TableCell>
                  <TableCell align="right">${tenant.averageInvoiceValue.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${tenant.paymentTimeliness}%`}
                      size="small"
                      sx={{
                        backgroundColor: getTimelinessColor(tenant.paymentTimeliness),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TenantMetrics;