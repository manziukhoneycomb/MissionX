import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import {
  VictoryPie,
  VictoryContainer,
  VictoryTooltip,
  VictoryTheme,
  VictoryLegend,
} from 'victory';
import { InvoiceStatus as InvoiceStatusType, ChartFilters } from '../types/analytics';
import { useInvoiceAging } from '../analyticsQueries';

interface InvoiceStatusProps {
  data: InvoiceStatusType;
  filters: ChartFilters;
  isLoading: boolean;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ data, filters, isLoading }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'overview' | 'aging'>('overview');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Query parameters for aging data
  const queryParams = useMemo(() => {
    const params: any = {};
    if (filters.dateRange.startDate) {
      params.startDate = filters.dateRange.startDate.toISOString().split('T')[0];
    }
    if (filters.dateRange.endDate) {
      params.endDate = filters.dateRange.endDate.toISOString().split('T')[0];
    }
    if (filters.selectedTenantId) {
      params.tenantId = filters.selectedTenantId;
    }
    return params;
  }, [filters]);

  const { data: agingData } = useInvoiceAging(queryParams);

  // Pie chart data for status overview
  const statusPieData = useMemo(() => {
    if (!data) return [];
    
    return [
      {
        x: 'Paid',
        y: data.paidCount,
        amount: data.paidAmount,
        label: `Paid\n${data.paidCount} invoices\n$${data.paidAmount.toLocaleString()}`,
      },
      {
        x: 'Unpaid',
        y: data.unpaidCount,
        amount: data.unpaidAmount,
        label: `Unpaid\n${data.unpaidCount} invoices\n$${data.unpaidAmount.toLocaleString()}`,
      },
      {
        x: 'Overdue',
        y: data.overdueCount,
        amount: data.overdueAmount,
        label: `Overdue\n${data.overdueCount} invoices\n$${data.overdueAmount.toLocaleString()}`,
      },
    ].filter(item => item.y > 0);
  }, [data]);

  // Pie chart data for aging analysis
  const agingPieData = useMemo(() => {
    return agingData?.map(item => ({
      x: item.ageRange,
      y: item.count,
      amount: item.totalValue,
      percentage: item.percentage,
      label: `${item.ageRange}\n${item.count} invoices\n$${item.totalValue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
    })) || [];
  }, [agingData]);

  // Color schemes
  const statusColors = {
    'Paid': theme.palette.success.main,
    'Unpaid': theme.palette.warning.main,
    'Overdue': theme.palette.error.main,
  };

  const agingColors = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.grey[600],
  ];

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleViewToggle = (mode: 'overview' | 'aging') => {
    setViewMode(mode);
    handleMenuClose();
  };

  const handleExport = () => {
    const csvData = viewMode === 'overview' 
      ? [
          { Status: 'Paid', Count: data.paidCount, Amount: data.paidAmount },
          { Status: 'Unpaid', Count: data.unpaidCount, Amount: data.unpaidAmount },
          { Status: 'Overdue', Count: data.overdueCount, Amount: data.overdueAmount },
        ]
      : agingData?.map(item => ({
          'Age Range': item.ageRange,
          Count: item.count,
          'Total Value': item.totalValue,
          'Percentage': item.percentage,
        })) || [];
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    handleMenuClose();
  };

  const totalInvoices = data ? data.paidCount + data.unpaidCount + data.overdueCount : 0;
  const totalAmount = data ? data.paidAmount + data.unpaidAmount + data.overdueAmount : 0;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <ReceiptIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              {viewMode === 'overview' ? 'Invoice Status' : 'Invoice Aging'}
            </Typography>
          </Box>
          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleViewToggle('overview')}>Status Overview</MenuItem>
            <MenuItem onClick={() => handleViewToggle('aging')}>Aging Analysis</MenuItem>
            <MenuItem onClick={handleExport}>Export CSV</MenuItem>
          </Menu>
        </Box>

        {viewMode === 'overview' ? (
          <>
            {/* Status Overview */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    {data?.paidCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid
                  </Typography>
                  <Typography variant="caption" display="block">
                    ${(data?.paidAmount || 0).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <PendingIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" color="warning.main">
                    {data?.unpaidCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unpaid
                  </Typography>
                  <Typography variant="caption" display="block">
                    ${(data?.unpaidAmount || 0).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <ErrorIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" color="error.main">
                    {data?.overdueCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                  <Typography variant="caption" display="block">
                    ${(data?.overdueAmount || 0).toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Status Pie Chart */}
            <Box sx={{ height: 250, width: '100%' }}>
              {statusPieData.length > 0 ? (
                <VictoryPie
                  data={statusPieData}
                  theme={VictoryTheme.material}
                  containerComponent={<VictoryContainer responsive={true} />}
                  colorScale={statusPieData.map(item => statusColors[item.x as keyof typeof statusColors])}
                  labelComponent={<VictoryTooltip />}
                  innerRadius={60}
                  padAngle={3}
                />
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  color="text.secondary"
                >
                  No data available
                </Box>
              )}
            </Box>
          </>
        ) : (
          <>
            {/* Aging Analysis */}
            {agingData && agingData.length > 0 && (
              <Grid container spacing={1} mb={2}>
                {agingData.map((item, index) => (
                  <Grid item xs={6} sm={4} md={2.4} key={item.ageRange}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.ageRange}
                      </Typography>
                      <Typography variant="h6" sx={{ color: agingColors[index] || theme.palette.grey[600] }}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ${item.totalValue.toLocaleString()}
                      </Typography>
                      <Chip
                        label={`${item.percentage.toFixed(1)}%`}
                        size="small"
                        color={item.percentage > 20 ? 'error' : item.percentage > 10 ? 'warning' : 'success'}
                        sx={{ mt: 0.5 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Aging Pie Chart */}
            <Box sx={{ height: 250, width: '100%' }}>
              {agingPieData.length > 0 ? (
                <VictoryPie
                  data={agingPieData}
                  theme={VictoryTheme.material}
                  containerComponent={<VictoryContainer responsive={true} />}
                  colorScale={agingColors}
                  labelComponent={<VictoryTooltip />}
                  innerRadius={60}
                  padAngle={3}
                />
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  color="text.secondary"
                >
                  No aging data available
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Summary */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
              <Typography variant="h6">
                {totalInvoices.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h6" color="primary">
                ${totalAmount.toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceStatus;