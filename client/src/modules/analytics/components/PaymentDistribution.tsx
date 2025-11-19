import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryContainer,
  VictoryTheme,
  VictoryPie,
} from 'victory';
import { PaymentDistribution as PaymentDistributionType, ChartFilters } from '../types/analytics';

interface PaymentDistributionProps {
  data: PaymentDistributionType;
  filters: ChartFilters;
  isLoading: boolean;
}

type DistributionView = 'timing' | 'amount' | 'customer' | 'vendor';

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data, filters, isLoading }) => {
  const theme = useTheme();
  const [distributionView, setDistributionView] = useState<DistributionView>('timing');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Get current data based on view
  const currentData = useMemo(() => {
    if (!data) return [];
    
    switch (distributionView) {
      case 'timing':
        return data.byTiming?.map(item => ({
          x: item.category,
          y: item.count,
          value: item.totalValue,
          percentage: item.percentage,
          label: `${item.category}\n${item.count} invoices\n$${item.totalValue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
        })) || [];
      case 'amount':
        return data.byAmountRange?.map(item => ({
          x: item.range,
          y: item.count,
          value: item.totalValue,
          percentage: item.percentage,
          label: `${item.range}\n${item.count} invoices\n$${item.totalValue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
        })) || [];
      case 'customer':
        return data.byCustomer?.map(item => ({
          x: item.customerName.length > 20 
            ? `${item.customerName.substring(0, 20)}...` 
            : item.customerName,
          y: item.invoiceCount,
          value: item.totalValue,
          percentage: item.percentage,
          label: `${item.customerName}\n${item.invoiceCount} invoices\n$${item.totalValue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
        })) || [];
      case 'vendor':
        return data.byVendor?.map(item => ({
          x: item.vendorName.length > 20 
            ? `${item.vendorName.substring(0, 20)}...` 
            : item.vendorName,
          y: item.invoiceCount,
          value: item.totalValue,
          percentage: item.percentage,
          label: `${item.vendorName}\n${item.invoiceCount} invoices\n$${item.totalValue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
        })) || [];
      default:
        return [];
    }
  }, [data, distributionView]);

  // Color scale for charts
  const colorScale = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const handleDistributionViewChange = (_: React.MouseEvent<HTMLElement>, newView: DistributionView | null) => {
    if (newView) {
      setDistributionView(newView);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleChartTypeChange = (type: 'bar' | 'pie') => {
    setChartType(type);
    handleMenuClose();
  };

  const handleExport = () => {
    const csvData = currentData.map(item => ({
      Category: item.x,
      Count: item.y,
      Value: item.value,
      Percentage: `${item.percentage.toFixed(1)}%`,
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-distribution-${distributionView}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    handleMenuClose();
  };

  const getViewTitle = () => {
    switch (distributionView) {
      case 'timing': return 'Payment Timing Distribution';
      case 'amount': return 'Amount Range Distribution';
      case 'customer': return 'Top Customers Distribution';
      case 'vendor': return 'Top Vendors Distribution';
      default: return 'Payment Distribution';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <PaymentIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Payment Distribution</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ToggleButtonGroup
              value={distributionView}
              exclusive
              onChange={handleDistributionViewChange}
              size="small"
            >
              <ToggleButton value="timing">Timing</ToggleButton>
              <ToggleButton value="amount">Amount</ToggleButton>
              <ToggleButton value="customer">Customer</ToggleButton>
              <ToggleButton value="vendor">Vendor</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              <MenuItem onClick={() => handleChartTypeChange('bar')}>Bar Chart</MenuItem>
              <MenuItem onClick={() => handleChartTypeChange('pie')}>Pie Chart</MenuItem>
              <MenuItem onClick={handleExport}>Export CSV</MenuItem>
            </Menu>
          </Box>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          {getViewTitle()}
        </Typography>

        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 350, width: '100%' }}>
              {currentData.length > 0 ? (
                chartType === 'bar' ? (
                  <VictoryChart
                    theme={VictoryTheme.material}
                    containerComponent={<VictoryContainer responsive={true} />}
                    domainPadding={{ x: 40 }}
                    padding={{ left: 80, top: 20, right: 50, bottom: 100 }}
                  >
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(value) => 
                        distributionView === 'customer' || distributionView === 'vendor'
                          ? value.toString()
                          : value.toString()
                      }
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
                      data={currentData}
                      colorScale={colorScale}
                      labelComponent={<VictoryTooltip />}
                    />
                  </VictoryChart>
                ) : (
                  <VictoryPie
                    data={currentData}
                    theme={VictoryTheme.material}
                    containerComponent={<VictoryContainer responsive={true} />}
                    colorScale={colorScale}
                    labelComponent={<VictoryTooltip />}
                    innerRadius={60}
                    padAngle={3}
                  />
                )
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  color="text.secondary"
                >
                  No data available for {distributionView}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Data Table */}
          <Grid item xs={12} md={4}>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" noWrap title={item.label.split('\n')[0]}>
                          {item.x}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.y}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${item.value.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary">
                          {item.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Summary Statistics */}
        <Box display="flex" gap={3} mt={3} pt={2} borderTop={1} borderColor="divider">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Items
            </Typography>
            <Typography variant="h6">
              {currentData.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Count
            </Typography>
            <Typography variant="h6">
              {currentData.reduce((sum, item) => sum + item.y, 0).toLocaleString()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
            <Typography variant="h6" color="primary">
              ${currentData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentDistribution;