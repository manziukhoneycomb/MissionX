import React, { useState } from 'react';
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryScatter,
} from 'victory';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { TenantMetrics } from '../../types/analytics';

interface TenantPerformanceChartProps {
  data: TenantMetrics;
  height?: number;
}

type MetricType = 'invoiceCount' | 'revenue' | 'avgValue';

const TenantPerformanceChart: React.FC<TenantPerformanceChartProps> = ({
  data,
  height = 300,
}) => {
  const theme = useTheme();
  const [metricType, setMetricType] = useState<MetricType>('revenue');

  const handleMetricChange = (_event: React.MouseEvent<HTMLElement>, newMetric: MetricType | null) => {
    if (newMetric) {
      setMetricType(newMetric);
    }
  };

  const getMetricValue = (tenant: any) => {
    switch (metricType) {
      case 'invoiceCount':
        return tenant.invoiceCount;
      case 'avgValue':
        return tenant.avgInvoiceValue;
      case 'revenue':
      default:
        return tenant.totalRevenue;
    }
  };

  const getMetricLabel = () => {
    switch (metricType) {
      case 'invoiceCount':
        return 'Invoice Count';
      case 'avgValue':
        return 'Average Invoice Value';
      case 'revenue':
      default:
        return 'Total Revenue';
    }
  };

  const formatValue = (value: number) => {
    switch (metricType) {
      case 'invoiceCount':
        return value.toString();
      case 'avgValue':
      case 'revenue':
      default:
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(0)}K`;
        }
        return `$${value.toLocaleString()}`;
    }
  };

  const chartData = data.invoicesPerTenant
    .slice(0, 10) // Show top 10
    .map((tenant, index) => ({
      x: index + 1,
      y: getMetricValue(tenant),
      label: `${tenant.tenantName}: ${formatValue(getMetricValue(tenant))}`,
      tenant: tenant.tenantName,
    }));

  const customTooltip = ({ datum }: any) => {
    if (!datum) return null;
    
    return (
      <Box
        sx={{
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1,
          boxShadow: theme.shadows[2],
          maxWidth: 200,
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {datum.tenant}
        </div>
        <div style={{ fontSize: '12px', color: theme.palette.primary.main }}>
          {getMetricLabel()}: {formatValue(datum.y)}
        </div>
      </Box>
    );
  };

  const getXAxisLabel = (tickValue: number) => {
    const tenant = data.invoicesPerTenant[tickValue - 1];
    if (!tenant) return '';
    
    // Truncate long names
    return tenant.tenantName.length > 10
      ? `${tenant.tenantName.substring(0, 10)}...`
      : tenant.tenantName;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Top Customer Performance by {getMetricLabel()}
        </Typography>
        <ToggleButtonGroup
          value={metricType}
          exclusive
          onChange={handleMetricChange}
          size="small"
        >
          <ToggleButton value="revenue">Revenue</ToggleButton>
          <ToggleButton value="invoiceCount">Count</ToggleButton>
          <ToggleButton value="avgValue">Avg Value</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <VictoryChart
        theme={VictoryTheme.material}
        width={800}
        height={height}
        padding={{ left: 80, right: 50, top: 20, bottom: 80 }}
        containerComponent={<VictoryContainer responsive />}
        domainPadding={{ x: 40 }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={formatValue}
          style={{
            grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
            tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
          }}
        />
        <VictoryAxis
          tickFormat={getXAxisLabel}
          style={{
            tickLabels: { 
              fontSize: 11, 
              fill: theme.palette.text.secondary,
              angle: -45,
            },
          }}
        />

        <VictoryBar
          data={chartData}
          style={{
            data: {
              fill: ({ index }) => {
                const colors = [
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                  theme.palette.success.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                ];
                return colors[index % colors.length];
              },
              fillOpacity: 0.8,
            },
          }}
          labelComponent={<VictoryTooltip flyoutComponent={customTooltip} />}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      </VictoryChart>

      {/* Payment Timeliness Scatter Plot */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Payment Timeliness vs Invoice Count
        </Typography>
        <VictoryChart
          theme={VictoryTheme.material}
          width={800}
          height={300}
          padding={{ left: 80, right: 50, top: 20, bottom: 60 }}
          containerComponent={<VictoryContainer responsive />}
        >
          <VictoryAxis
            dependentAxis
            label="Timeliness Rate (%)"
            style={{
              axisLabel: { fontSize: 12, padding: 40 },
              grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            }}
          />
          <VictoryAxis
            label="Invoice Count"
            style={{
              axisLabel: { fontSize: 12, padding: 35 },
              grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
              tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
            }}
          />

          <VictoryScatter
            data={data.paymentTimeliness.map(item => ({
              x: item.onTimePayments + item.latePayments,
              y: item.timelinessRate,
              size: Math.max(3, Math.min(10, item.onTimePayments / 5)),
              label: `${item.tenantName}: ${item.timelinessRate.toFixed(1)}% on-time`,
            }))}
            style={{
              data: { fill: theme.palette.secondary.main, fillOpacity: 0.7 },
            }}
            labelComponent={<VictoryTooltip />}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        </VictoryChart>
      </Box>
    </Box>
  );
};

export default TenantPerformanceChart;