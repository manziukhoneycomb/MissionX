import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryTheme,
  VictoryContainer,
  VictoryPie,
} from 'victory';
import { InvoiceStatusMetrics } from '../types/analytics';

interface InvoiceStatusOverviewProps {
  readonly data: InvoiceStatusMetrics;
}

const InvoiceStatusOverview: React.FC<InvoiceStatusOverviewProps> = ({ data }) => {
  const theme = useTheme();
  const [viewType, setViewType] = useState<'status' | 'aging'>('status');

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: 'status' | 'aging' | null,
  ) => {
    if (newViewType) {
      setViewType(newViewType);
    }
  };

  const statusData = data.statusOverview.map((item) => ({
    x: item.status,
    y: item.count,
    label: `${item.status}\nCount: ${item.count}\nAmount: $${item.totalAmount.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
  }));

  const agingData = data.agingAnalysis.map((item) => ({
    x: item.ageRange,
    y: item.count,
    label: `${item.ageRange}\nCount: ${item.count}\nAmount: $${item.totalAmount.toLocaleString()}`,
  }));

  const pieData = data.statusOverview.map((item) => ({
    x: item.status,
    y: item.count,
    label: `${item.status}: ${item.count} (${item.percentage.toFixed(1)}%)`,
  }));

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return theme.palette.success.main;
      case 'unpaid':
        return theme.palette.warning.main;
      case 'overdue':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const statusColorScale = data.statusOverview.map(item => getStatusColor(item.status));

  return (
    <Card
      sx={{
        height: '500px',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <CardHeader
        title={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2">
              Invoice Status
            </Typography>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              size="small">
              <ToggleButton value="status">Status</ToggleButton>
              <ToggleButton value="aging">Aging</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
        subheader={
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total: {data.overallMetrics.totalInvoices}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Avg Days: {data.overallMetrics.averageDaysToPayment}
              </Typography>
            </Grid>
          </Grid>
        }
      />
      <CardContent sx={{ flex: 1, p: 1 }}>
        {viewType === 'status' ? (
          <Box display="flex" height="100%">
            <Box sx={{ width: '60%', height: '100%' }}>
              <VictoryChart
                theme={VictoryTheme.material}
                containerComponent={
                  <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
                }
                padding={{ left: 60, top: 20, right: 20, bottom: 60 }}
                domainPadding={{ x: 40 }}>
                
                <VictoryAxis
                  dependentAxis
                  tickFormat={(value) => `${value}`}
                  style={{
                    tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                    grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
                  }}
                />
                
                <VictoryAxis
                  style={{
                    tickLabels: { fontSize: 12, fill: theme.palette.text.secondary, angle: -45 },
                  }}
                />
                
                <VictoryBar
                  data={statusData}
                  style={{
                    data: { fill: ({ datum }) => getStatusColor(datum.x) }
                  }}
                  labelComponent={
                    <VictoryTooltip
                      style={{
                        fill: theme.palette.text.primary,
                        fontSize: 12,
                      }}
                      flyoutStyle={{
                        stroke: theme.palette.divider,
                        fill: theme.palette.background.paper,
                      }}
                    />
                  }
                  animate={{
                    duration: 1000,
                    onLoad: { duration: 500 }
                  }}
                />
              </VictoryChart>
            </Box>
            <Box sx={{ width: '40%', height: '100%' }}>
              <VictoryPie
                data={pieData}
                theme={VictoryTheme.material}
                colorScale={statusColorScale}
                containerComponent={
                  <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
                }
                innerRadius={40}
                padAngle={3}
                labelRadius={({ innerRadius }) => innerRadius as number + 60}
                style={{
                  labels: { fontSize: 10, fill: theme.palette.text.primary },
                }}
                labelComponent={
                  <VictoryTooltip
                    style={{
                      fill: theme.palette.text.primary,
                      fontSize: 12,
                    }}
                    flyoutStyle={{
                      stroke: theme.palette.divider,
                      fill: theme.palette.background.paper,
                    }}
                  />
                }
                animate={{
                  duration: 1000,
                }}
              />
            </Box>
          </Box>
        ) : (
          <VictoryChart
            theme={VictoryTheme.material}
            containerComponent={
              <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
            }
            padding={{ left: 60, top: 20, right: 20, bottom: 80 }}
            domainPadding={{ x: 40 }}>
            
            <VictoryAxis
              dependentAxis
              tickFormat={(value) => `${value}`}
              style={{
                tickLabels: { fontSize: 12, fill: theme.palette.text.secondary },
                grid: { stroke: theme.palette.divider, strokeWidth: 0.5 },
              }}
            />
            
            <VictoryAxis
              style={{
                tickLabels: { fontSize: 11, fill: theme.palette.text.secondary, angle: -45 },
              }}
            />
            
            <VictoryBar
              data={agingData}
              style={{
                data: { fill: theme.palette.secondary.main }
              }}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                  }}
                  flyoutStyle={{
                    stroke: theme.palette.divider,
                    fill: theme.palette.background.paper,
                  }}
                />
              }
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
            />
          </VictoryChart>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceStatusOverview;