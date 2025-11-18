import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  VictoryPie,
  VictoryContainer,
  VictoryTooltip,
  VictoryLegend,
} from 'victory';
import {
  CheckCircle,
  Cancel,
  Warning,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useInvoiceStatusDistribution } from '../analyticsQueries';
import { DateRangeFilter } from '../services/analyticsService';

interface InvoiceStatusProps {
  filters?: DateRangeFilter;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ filters }) => {
  const [viewType, setViewType] = useState<'chart' | 'list'>('chart');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data, isLoading, error } = useInvoiceStatusDistribution(filters);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewToggle = () => {
    setViewType(viewType === 'chart' ? 'list' : 'chart');
    handleMenuClose();
  };

  const handleExport = () => {
    if (data?.data) {
      const csvData = data.data.map(item => ({
        Status: item.status,
        Count: item.count,
        Percentage: `${item.percentage}%`,
        'Total Amount': item.totalAmount,
      }));
      
      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice-status-distribution.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
    handleMenuClose();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load invoice status data. Please try again later.
      </Alert>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No invoice status data available.
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'unpaid': return '#ff9800';
      case 'overdue': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'unpaid': return <Warning sx={{ color: '#ff9800' }} />;
      case 'overdue': return <Cancel sx={{ color: '#f44336' }} />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'unpaid': return 'Unpaid';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  const chartData = data.data.map(item => ({
    x: getStatusLabel(item.status),
    y: item.percentage,
    label: `${getStatusLabel(item.status)}: ${item.count} (${item.percentage}%)`,
    count: item.count,
    amount: item.totalAmount,
  }));

  const totalInvoices = data.data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <Box>
      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total: {totalInvoices.toLocaleString()} invoices
        </Typography>

        <IconButton onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
        
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleViewToggle}>
            Switch to {viewType === 'chart' ? 'List' : 'Chart'} View
          </MenuItem>
          <MenuItem onClick={handleExport}>
            Export Data (CSV)
          </MenuItem>
        </Menu>
      </Box>

      {viewType === 'chart' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Pie Chart */}
          <Box sx={{ width: '100%', height: 220 }}>
            <VictoryPie
              data={chartData}
              x="x"
              y="y"
              width={300}
              height={220}
              innerRadius={60}
              padAngle={2}
              colorScale={data.data.map(item => getStatusColor(item.status))}
              labelComponent={<VictoryTooltip />}
              animate={{
                duration: 1000,
                onLoad: { duration: 500 }
              }}
              containerComponent={<VictoryContainer responsive={true} />}
            />
          </Box>

          {/* Center Label */}
          <Box 
            sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              mt: -2
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {totalInvoices.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Total Invoices
            </Typography>
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {data.data.map((item) => (
                <Chip
                  key={item.status}
                  size="small"
                  label={`${getStatusLabel(item.status)} (${item.percentage}%)`}
                  sx={{
                    backgroundColor: getStatusColor(item.status),
                    color: 'white',
                    '& .MuiChip-label': { fontSize: '0.75rem' }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Paper sx={{ maxHeight: 300, overflow: 'auto' }}>
          <List dense>
            {data.data.map((item) => (
              <ListItem key={item.status}>
                <ListItemIcon>
                  {getStatusIcon(item.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {getStatusLabel(item.status)}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${item.percentage}%`}
                        color={item.status === 'paid' ? 'success' : 
                               item.status === 'unpaid' ? 'warning' : 'error'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption">
                        {item.count.toLocaleString()} invoices
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        ${item.totalAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            
            {/* Total Row */}
            <ListItem divider sx={{ backgroundColor: 'action.hover' }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="bold">
                      Total
                    </Typography>
                    <Chip size="small" label="100%" />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" fontWeight="medium">
                      {totalInvoices.toLocaleString()} invoices
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      ${totalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default InvoiceStatus;