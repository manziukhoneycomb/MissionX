import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryContainer,
  VictoryStack,
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
  ButtonGroup,
  Button,
  Menu,
  Grid,
} from '@mui/material';
import {
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { PaymentDistribution as PaymentDistributionType } from '../services/analyticsService';

interface PaymentDistributionProps {
  data: PaymentDistributionType[];
}

type ViewMode = 'chart' | 'table';
type ChartType = 'count' | 'amount' | 'stacked';

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({ data }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [chartType, setChartType] = useState<ChartType>('amount');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const chartData = data.map((item, index) => ({
    x: index + 1,
    y: chartType === 'count' ? item.count : item.amount,
    label: `${item.method}: ${chartType === 'count' ? `${item.count} payments` : `$${item.amount.toLocaleString()}`}`,
    method: item.method,
    count: item.count,
    amount: item.amount,
  }));

  const stackedData = {
    count: data.map((item, index) => ({
      x: index + 1,
      y: item.count,
      method: item.method,
    })),
    amount: data.map((item, index) => ({
      x: index + 1,
      y: item.amount,
      method: item.method,
    })),
  };

  const colorScale = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value as ChartType);
  };

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (format === 'csv') {
      const csvData = data
        .map(item => `${item.method},${item.count},${item.amount}`)
        .join('\n');
      const blob = new Blob([`Payment Method,Count,Amount\n${csvData}`], {
        type: 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payment-distribution.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const svgElement = document.querySelector('.payment-distribution-chart svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        if (format === 'svg') {
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'payment-distribution.svg';
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'png') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'payment-distribution.png';
                a.click();
                URL.revokeObjectURL(url);
              }
            });
          };
          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }
      }
    }
    setAnchorEl(null);
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

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
        No payment distribution data available
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={2}>
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={viewMode === 'chart' ? 'contained' : 'outlined'}
              onClick={() => handleViewModeChange('chart')}
              startIcon={<BarChartIcon />}
            >
              Chart
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => handleViewModeChange('table')}
              startIcon={<TableChartIcon />}
            >
              Table
            </Button>
          </ButtonGroup>

          {viewMode === 'chart' && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={handleChartTypeChange}
              >
                <MenuItem value="count">Count</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="stacked">Stacked</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        <Tooltip title="Export Data">
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {viewMode === 'chart' ? (
        <Box className="payment-distribution-chart" height="350px">
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={20}
            height={350}
            width={600}
            containerComponent={<VictoryContainer responsive={false} />}
            padding={{ left: 80, top: 20, right: 50, bottom: 80 }}
          >
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => 
                chartType === 'amount' || chartType === 'stacked' 
                  ? `$${(t / 1000).toFixed(0)}k`
                  : t
              }
              style={{
                tickLabels: { 
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                },
              }}
            />
            <VictoryAxis
              tickFormat={(x) => {
                const item = data[x - 1];
                return item ? item.method : '';
              }}
              style={{
                tickLabels: { 
                  fill: theme.palette.text.secondary,
                  fontSize: 11,
                  angle: -45,
                },
              }}
            />

            {chartType === 'stacked' ? (
              <VictoryStack colorScale={colorScale}>
                <VictoryBar
                  data={stackedData.count}
                  animate={{ duration: 1000 }}
                  labelComponent={
                    <VictoryTooltip
                      style={{
                        fill: theme.palette.background.paper,
                        stroke: theme.palette.divider,
                      }}
                    />
                  }
                />
              </VictoryStack>
            ) : (
              <VictoryBar
                data={chartData}
                style={{
                  data: {
                    fill: ({ index }) => colorScale[index % colorScale.length],
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
            )}
          </VictoryChart>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Percentage of Count</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Percentage of Amount</TableCell>
                <TableCell align="right">Avg per Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.method}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {item.method}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.count}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${item.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${item.count > 0 ? Math.round(item.amount / item.count).toLocaleString() : 0}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Box p={2} bgcolor={alpha(theme.palette.grey[100], 0.5)}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Payments: <strong>{totalCount}</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary" align="right">
                  Total Amount: <strong>${totalAmount.toLocaleString()}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('png')}>Export as PNG</MenuItem>
        <MenuItem onClick={() => handleExport('svg')}>Export as SVG</MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>Export Data as CSV</MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentDistribution;