import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Typography,
  Chip,
} from '@mui/material';
import {
  Sort as SortIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { TenantMetric } from '../services/analyticsService';

interface TenantMetricsProps {
  data: TenantMetric[];
}

type SortField = 'name' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'chart' | 'table';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data }) => {
  const theme = useTheme();
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return sortOrder === 'asc' 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const chartData = sortedData.slice(0, 10).map((tenant, index) => ({
    x: index + 1,
    y: tenant.totalRevenue,
    label: `${tenant.name}: $${tenant.totalRevenue.toLocaleString()}`,
    tenant: tenant.name,
    invoiceCount: tenant.invoiceCount,
    avgValue: tenant.averageInvoiceValue,
    timeliness: tenant.paymentTimeliness,
  }));

  const handleSortChange = (event: SelectChangeEvent) => {
    const [field, order] = event.target.value.split('-');
    setSortField(field as SortField);
    setSortOrder(order as SortOrder);
  };

  const handleViewModeChange = (event: SelectChangeEvent) => {
    setViewMode(event.target.value as ViewMode);
  };

  const getTimelinessColor = (timeliness: number) => {
    if (timeliness >= 90) return theme.palette.success.main;
    if (timeliness >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getTimelinessLabel = (timeliness: number) => {
    if (timeliness >= 90) return 'Excellent';
    if (timeliness >= 70) return 'Good';
    if (timeliness >= 50) return 'Fair';
    return 'Poor';
  };

  if (!data || data.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
        bgcolor={alpha(theme.palette.grey[100], 0.1)}
        borderRadius={1}
      >
        No tenant data available
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={viewMode}
              label="View Mode"
              onChange={handleViewModeChange}
            >
              <MenuItem value="chart">Chart View</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={`${sortField}-${sortOrder}`}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="totalRevenue-desc">Revenue (High to Low)</MenuItem>
              <MenuItem value="totalRevenue-asc">Revenue (Low to High)</MenuItem>
              <MenuItem value="invoiceCount-desc">Invoice Count (High to Low)</MenuItem>
              <MenuItem value="invoiceCount-asc">Invoice Count (Low to High)</MenuItem>
              <MenuItem value="averageInvoiceValue-desc">Avg Value (High to Low)</MenuItem>
              <MenuItem value="averageInvoiceValue-asc">Avg Value (Low to High)</MenuItem>
              <MenuItem value="paymentTimeliness-desc">Timeliness (High to Low)</MenuItem>
              <MenuItem value="paymentTimeliness-asc">Timeliness (Low to High)</MenuItem>
              <MenuItem value="name-asc">Name (A to Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z to A)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {viewMode === 'chart' ? (
        <Box height="400px">
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Top 10 Tenants by Revenue
          </Typography>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={20}
            height={350}
            width={700}
            containerComponent={<VictoryContainer responsive={false} />}
            padding={{ left: 100, top: 20, right: 50, bottom: 80 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `$${(t / 1000).toFixed(0)}k`}
              style={{
                tickLabels: { 
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => {
                const tenant = chartData[x - 1];
                return tenant ? tenant.tenant.slice(0, 10) + (tenant.tenant.length > 10 ? '...' : '') : '';
              }}
              style={{
                tickLabels: { 
                  fill: theme.palette.text.secondary,
                  fontSize: 10,
                  angle: -45,
                },
              }}
            />
            <VictoryBar
              data={chartData}
              style={{
                data: {
                  fill: ({ datum }) => {
                    const timeliness = datum.timeliness;
                    return getTimelinessColor(timeliness);
                  },
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                />
              }
            />
          </VictoryChart>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tenant Name</TableCell>
                <TableCell align="right">Invoice Count</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
                <TableCell align="right">Avg Invoice Value</TableCell>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="center">
                    Payment Timeliness
                    <Tooltip title="Percentage of invoices paid on time">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box display="flex" alignItems="center">
                      {tenant.name}
                      {tenant.totalRevenue >= 10000 && (
                        <TrendingUpIcon 
                          color="success" 
                          fontSize="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {tenant.invoiceCount}
                    </Typography>
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
                      label={`${tenant.paymentTimeliness}% ${getTimelinessLabel(tenant.paymentTimeliness)}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getTimelinessColor(tenant.paymentTimeliness), 0.1),
                        color: getTimelinessColor(tenant.paymentTimeliness),
                        fontWeight: 'medium',
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