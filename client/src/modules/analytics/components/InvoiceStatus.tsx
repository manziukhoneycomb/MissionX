import React, { useState } from 'react';
import {
  VictoryPie,
  VictoryContainer,
  VictoryTheme,
  VictoryTooltip,
  VictoryLegend,
} from 'victory';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  PendingActions,
  Warning,
  Circle,
} from '@mui/icons-material';
import { useInvoiceStatusData } from '../analyticsQueries';
import { useAnalyticsFilters } from './AnalyticsPage';

const InvoiceStatus: React.FC = () => {
  const theme = useTheme();
  const { filters } = useAnalyticsFilters();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const { data: statusData, isLoading, error } = useInvoiceStatusData(filters);

  const handleStatusClick = (status: string) => {
    // TODO: Navigate to filtered invoice list
    console.log('Clicked status:', status);
    setSelectedStatus(selectedStatus === status ? null : status);
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
        Failed to load invoice status data
      </Alert>
    );
  }

  if (!statusData || statusData.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No invoice status data available
      </Alert>
    );
  }

  const totalInvoices = statusData.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = statusData.reduce((sum, item) => sum + item.totalAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.palette.success.main;
      case 'unpaid':
        return theme.palette.warning.main;
      case 'overdue':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'unpaid':
        return <PendingActions sx={{ color: theme.palette.warning.main }} />;
      case 'overdue':
        return <Warning sx={{ color: theme.palette.error.main }} />;
      default:
        return <Circle />;
    }
  };

  const chartData = statusData.map((item) => ({
    x: item.status,
    y: item.count,
    label: `${item.status}: ${item.count} (${item.percentage.toFixed(1)}%)`,
  }));

  const pieColors = statusData.map((item) => getStatusColor(item.status));

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary">
                {totalInvoices.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" color="primary">
                ${totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <VictoryPie
          data={chartData}
          width={300}
          height={250}
          innerRadius={60}
          padAngle={3}
          colorScale={pieColors}
          containerComponent={<VictoryContainer responsive={true} />}
          animate={{
            duration: 1000,
          }}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onClick: (evt, data) => {
                  handleStatusClick(data.datum.x);
                },
                onMouseOver: () => {
                  return [
                    {
                      target: 'data',
                      mutation: { style: { fillOpacity: 0.8 } }
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
      </Box>

      <List dense sx={{ mt: 2 }}>
        {statusData.map((item) => (
          <ListItem
            key={item.status}
            onClick={() => handleStatusClick(item.status)}
            sx={{
              cursor: 'pointer',
              borderRadius: 1,
              mb: 1,
              backgroundColor: selectedStatus === item.status 
                ? alpha(getStatusColor(item.status), 0.1)
                : 'transparent',
              '&:hover': {
                backgroundColor: alpha(getStatusColor(item.status), 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getStatusIcon(item.status)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {item.status}
                  </Typography>
                  <Chip
                    label={`${item.percentage.toFixed(1)}%`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: getStatusColor(item.status),
                      color: getStatusColor(item.status),
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.count} invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default InvoiceStatus;