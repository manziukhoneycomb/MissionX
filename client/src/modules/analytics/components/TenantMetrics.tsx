import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
} from 'victory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewListIcon from '@mui/icons-material/ViewList';
import BarChartIcon from '@mui/icons-material/BarChart';
import { TenantMetric } from '../types/analytics';

interface TenantMetricsProps {
  data: TenantMetric[];
}

type SortKey = 'tenantName' | 'invoiceCount' | 'totalRevenue' | 'averageInvoiceValue' | 'paymentTimeliness';
type ViewMode = 'chart' | 'table';

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<SortKey>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [metricType, setMetricType] = useState<'revenue' | 'count' | 'average'>('revenue');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    const csvData = data.map(item => ({
      'Tenant Name': item.tenantName,
      'Invoice Count': item.invoiceCount,
      'Total Revenue': item.totalRevenue,
      'Average Invoice Value': item.averageInvoiceValue,
      'Payment Timeliness': `${item.paymentTimeliness}%`,
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tenant-metrics.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }
    
    return (Number(aValue) - Number(bValue)) * multiplier;
  });

  const chartData = sortedData.slice(0, 10).map((item, index) => ({
    x: index + 1,
    y: metricType === 'revenue' 
      ? item.totalRevenue 
      : metricType === 'count' 
        ? item.invoiceCount 
        : item.averageInvoiceValue,
    tenant: item.tenantName,
    fullData: item,
  }));

  const getMetricLabel = () => {
    switch (metricType) {
      case 'revenue': return 'Total Revenue';
      case 'count': return 'Invoice Count';
      case 'average': return 'Avg Invoice Value';
      default: return 'Total Revenue';
    }
  };

  const formatValue = (value: number) => {
    if (metricType === 'count') {
      return value.toString();
    }
    return `$${value.toLocaleString()}`;
  };

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No tenant metrics available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Tenant Performance</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={metricType}
              label="Metric"
              onChange={(e) => setMetricType(e.target.value as any)}
            >
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="count">Count</MenuItem>
              <MenuItem value="average">Average</MenuItem>
            </Select>
          </FormControl>
          <IconButton 
            size="small" 
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            color={viewMode === 'chart' ? 'primary' : 'default'}
          >
            {viewMode === 'chart' ? <ViewListIcon /> : <BarChartIcon />}
          </IconButton>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleExport}>Export CSV</MenuItem>
      </Menu>

      <Box sx={{ height: 320, overflow: 'auto' }}>
        {viewMode === 'chart' ? (
          <VictoryChart
            domainPadding={20}
            theme={{
              axis: {
                style: {
                  axis: { stroke: theme.palette.divider },
                  tickLabels: { fill: theme.palette.text.secondary, fontSize: 10 },
                  grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
                },
              },
            }}
            padding={{ left: 80, right: 40, top: 20, bottom: 80 }}
            height={320}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => formatValue(value)}
              style={{
                grid: { stroke: theme.palette.divider, strokeDasharray: '2,2' },
              }}
            />
            <VictoryAxis
              tickFormat={(_, index) => {
                const tenant = chartData[index]?.tenant || '';
                return tenant.length > 8 ? `${tenant.substring(0, 8)}...` : tenant;
              }}
              style={{
                tickLabels: { angle: -45, textAnchor: 'end', fontSize: 9 },
              }}
            />
            
            <VictoryBar
              data={chartData}
              style={{
                data: {
                  fill: (props: any) => 
                    props.index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
            
            <VictoryTooltip
              renderInPortal={false}
              flyoutStyle={{
                stroke: theme.palette.divider,
                fill: theme.palette.background.paper,
              }}
              labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 11 }} />}
              datum={(datum: any) => 
                `${datum.tenant}\n${getMetricLabel()}: ${formatValue(datum.y)}\nInvoices: ${datum.fullData.invoiceCount}\nTimeliness: ${datum.fullData.paymentTimeliness}%`
              }
            />
          </VictoryChart>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'tenantName'}
                      direction={sortBy === 'tenantName' ? sortOrder : 'asc'}
                      onClick={() => handleSort('tenantName')}
                    >
                      Tenant
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'invoiceCount'}
                      direction={sortBy === 'invoiceCount' ? sortOrder : 'asc'}
                      onClick={() => handleSort('invoiceCount')}
                    >
                      Invoices
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'totalRevenue'}
                      direction={sortBy === 'totalRevenue' ? sortOrder : 'asc'}
                      onClick={() => handleSort('totalRevenue')}
                    >
                      Revenue
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'averageInvoiceValue'}
                      direction={sortBy === 'averageInvoiceValue' ? sortOrder : 'asc'}
                      onClick={() => handleSort('averageInvoiceValue')}
                    >
                      Avg Value
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={sortBy === 'paymentTimeliness'}
                      direction={sortBy === 'paymentTimeliness' ? sortOrder : 'asc'}
                      onClick={() => handleSort('paymentTimeliness')}
                    >
                      Timeliness
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((tenant) => (
                  <TableRow key={tenant.tenantId}>
                    <TableCell>{tenant.tenantName}</TableCell>
                    <TableCell align="right">{tenant.invoiceCount}</TableCell>
                    <TableCell align="right">${tenant.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell align="right">${tenant.averageInvoiceValue.toLocaleString()}</TableCell>
                    <TableCell align="right">{tenant.paymentTimeliness}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Paper>
  );
};

export default TenantMetrics;