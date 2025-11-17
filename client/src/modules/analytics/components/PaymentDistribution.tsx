import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  DonutLarge as DonutIcon,
  BarChart as BarChartIcon,
  TableRows as TableIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import {
  VictoryPie,
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
} from 'victory';
import { PaymentDistribution as PaymentDistributionType, AnalyticsFilters } from '../types/analytics';

interface PaymentDistributionProps {
  data: PaymentDistributionType[];
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

type ViewMode = 'pie' | 'bar' | 'table';

const PaymentDistribution: React.FC<PaymentDistributionProps> = ({
  data,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('pie');

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Payment Method', 'Count', 'Amount', 'Percentage'].join(','),
      ...data.map(item => [
        item.method,
        item.count,
        item.amount,
        `${item.percentage}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-distribution.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    x: item.method,
    y: item.count,
    amount: item.amount,
    fill: colors[index % colors.length],
  }));

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const topMethod = data.length > 0 ? data.reduce((prev, current) => 
    (current.amount > prev.amount) ? current : prev
  ) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card variant="outlined" sx={{ minWidth: 100 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Methods
              </Typography>
              <Typography variant="h6" color="primary">
                {data.length}
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ minWidth: 120 }}>
            <CardContent sx={{ py: 1, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Payments
              </Typography>
              <Typography variant="h6">
                {totalCount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>

          {topMethod && (
            <Card variant="outlined" sx={{ minWidth: 120 }}>
              <CardContent sx={{ py: 1, px: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Top Method
                </Typography>
                <Typography variant="h6" color="success.main">
                  {topMethod.method}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={handleExportData}>
            <ExportIcon />
          </IconButton>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="pie">
              <DonutIcon />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon />
            </ToggleButton>
            <ToggleButton value="table">
              <TableIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === 'pie' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <VictoryPie
            data={chartData}
            width={350}
            height={350}
            x="method"
            y="amount"
            innerRadius={70}
            padAngle={1}
            colorScale={colors}
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
              `${datum.method}`,
              `Amount: $${datum.amount.toLocaleString()}`,
              `Count: ${datum.count}`,
              `${datum.percentage}%`
            ]}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
            style={{
              data: {
                stroke: theme.palette.background.paper,
                strokeWidth: 2,
              },
              labels: {
                fontSize: 14,
                fill: theme.palette.text.primary,
                fontWeight: 'bold',
              }
            }}
          />
        </Box>
      )}

      {viewMode === 'bar' && (
        <Box sx={{ height: 300, width: '100%' }}>
          <VictoryChart
            height={300}
            width={600}
            domainPadding={{ x: 20 }}
            padding={{ left: 80, top: 20, right: 50, bottom: 80 }}
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
              x="method"
              y="amount"
              style={{
                data: {
                  fill: ({ datum, index }) => colors[index % colors.length],
                  stroke: theme.palette.background.paper,
                  strokeWidth: 1,
                },
              }}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 },
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: "white",
                    stroke: theme.palette.divider,
                    strokeWidth: 1,
                  }}
                />
              }
              labels={({ datum }) => [
                `${datum.method}`,
                `$${datum.amount.toLocaleString()}`,
                `${datum.count} payments`,
                `${datum.percentage}%`
              ]}
            />
          </VictoryChart>
        </Box>
      )}

      {viewMode === 'table' && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="right">Average</TableCell>
                <TableCell align="center">Distribution</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.method}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                      <Typography variant="body2" fontWeight="medium">
                        {item.method}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {item.count.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${item.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ${(item.amount / item.count).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.percentage}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.palette.grey[200],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: colors[index % colors.length],
                          },
                        }}
                      />
                      <Typography variant="body2" fontWeight="medium" sx={{ minWidth: 40 }}>
                        {item.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Switch between chart and table views to explore payment method distribution. 
          Export data using the download button.
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentDistribution;