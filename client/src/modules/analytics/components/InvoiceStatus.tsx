import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  useTheme,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  CheckCircle as PaidIcon,
  Schedule as UnpaidIcon,
  Warning as OverdueIcon,
  Visibility as ViewDetailsIcon,
} from '@mui/icons-material';
import {
  VictoryPie,
  VictoryChart,
  VictoryTooltip,
  VictoryLegend,
  VictoryAnimation,
} from 'victory';
import { InvoiceStatusData, AnalyticsFilters } from '../types/analytics';

interface InvoiceStatusProps {
  data: InvoiceStatusData[];
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({
  data,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const statusConfig = {
    paid: {
      icon: <PaidIcon />,
      color: theme.palette.success.main,
      label: 'Paid',
      description: 'Invoices that have been fully paid',
    },
    unpaid: {
      icon: <UnpaidIcon />,
      color: theme.palette.warning.main,
      label: 'Unpaid',
      description: 'Outstanding invoices within payment terms',
    },
    overdue: {
      icon: <OverdueIcon />,
      color: theme.palette.error.main,
      label: 'Overdue',
      description: 'Invoices past due date requiring attention',
    },
  };

  const handleStatusFilter = (status: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined,
    });
  };

  const handleSegmentClick = (datum: any) => {
    setSelectedSegment(datum.datum.status === selectedSegment ? null : datum.datum.status);
  };

  const chartData = data.map((item) => ({
    x: item.count,
    y: item.count,
    status: item.status,
    label: `${item.status}: ${item.count}`,
    percentage: item.percentage,
    amount: item.totalAmount,
  }));

  const totalInvoices = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card variant="outlined" sx={{ minWidth: 100 }}>
          <CardContent sx={{ py: 1, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h6" color="primary">
              {totalInvoices}
            </Typography>
          </CardContent>
        </Card>
        
        <Card variant="outlined" sx={{ minWidth: 120 }}>
          <CardContent sx={{ py: 1, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Value
            </Typography>
            <Typography variant="h6">
              ${totalAmount.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <VictoryPie
          data={chartData}
          width={300}
          height={300}
          x="status"
          y="y"
          innerRadius={60}
          padAngle={2}
          colorScale={data.map(item => statusConfig[item.status as keyof typeof statusConfig].color)}
          labelComponent={<VictoryTooltip />}
          labelRadius={({ innerRadius }) => innerRadius + 40}
          labels={({ datum }) => `${datum.status}\n${datum.percentage}%`}
          events={[{
            target: 'data',
            eventHandlers: {
              onClick: handleSegmentClick,
              onMouseOver: () => ({
                target: 'data',
                mutation: { style: { strokeWidth: 3, stroke: theme.palette.text.primary } }
              }),
              onMouseOut: () => ({
                target: 'data',
                mutation: { style: { strokeWidth: 1, stroke: 'transparent' } }
              })
            }
          }]}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
          style={{
            data: {
              strokeWidth: ({ datum }) => 
                selectedSegment === datum.status ? 3 : 1,
              stroke: ({ datum }) => 
                selectedSegment === datum.status ? theme.palette.text.primary : 'transparent'
            },
            labels: {
              fontSize: 12,
              fill: theme.palette.text.primary,
              fontWeight: 'bold',
            }
          }}
        />
      </Box>

      <List dense>
        {data.map((item) => {
          const config = statusConfig[item.status as keyof typeof statusConfig];
          const isSelected = filters.status?.includes(item.status);
          
          return (
            <ListItem
              key={item.status}
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${item.percentage}%`}
                    size="small"
                    style={{
                      backgroundColor: config.color,
                      color: 'white',
                    }}
                  />
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleStatusFilter(item.status)}
                    color={isSelected ? 'primary' : 'default'}
                  >
                    <ViewDetailsIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemIcon sx={{ color: config.color, minWidth: 40 }}>
                {config.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {config.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({item.count} invoices)
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {config.description}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      Total: ${item.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>

      {selectedSegment && (
        <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected: {statusConfig[selectedSegment as keyof typeof statusConfig].label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the chart segments to highlight specific status categories.
            Use the view details button to filter the dashboard data.
          </Typography>
        </Card>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Click on chart segments for details. Use the view buttons to filter invoices by status.
          {filters.status && filters.status.length > 0 && (
            <>
              {' '}Currently filtering by: {filters.status.join(', ')}.
              <Button 
                size="small" 
                onClick={() => onFiltersChange({ ...filters, status: undefined })}
                sx={{ ml: 1 }}
              >
                Clear filters
              </Button>
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default InvoiceStatus;