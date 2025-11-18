import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  VictoryPie,
  VictoryTooltip,
} from 'victory';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CircleIcon from '@mui/icons-material/Circle';
import { InvoiceStatusMetric } from '../types/analytics';

interface InvoiceStatusProps {
  data: InvoiceStatusMetric[];
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ data }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    const csvData = data.map(item => ({
      Status: item.status,
      Count: item.count,
      'Total Amount': item.totalAmount,
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice-status.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const chartData = data.map((item) => ({
    x: getStatusLabel(item.status),
    y: item.count,
    amount: item.totalAmount,
    color: getStatusColor(item.status),
  }));

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No invoice status data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Invoice Status</Typography>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
          >
            <CircleIcon />
          </IconButton>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleExport}>Export CSV</MenuItem>
        <MenuItem onClick={() => { setViewMode(viewMode === 'chart' ? 'list' : 'chart'); handleMenuClose(); }}>
          Switch to {viewMode === 'chart' ? 'List' : 'Chart'}
        </MenuItem>
      </Menu>

      <Box sx={{ height: 320 }}>
        {viewMode === 'chart' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <VictoryPie
                data={chartData}
                colorScale={chartData.map(d => d.color)}
                innerRadius={60}
                padAngle={3}
                animate={{
                  duration: 1000,
                  onLoad: { duration: 500 }
                }}
                width={280}
                height={280}
                labelRadius={({ innerRadius }) => (innerRadius as number) + 30 }
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{
                      stroke: theme.palette.divider,
                      fill: theme.palette.background.paper,
                    }}
                    labelComponent={<text style={{ fill: theme.palette.text.primary, fontSize: 11 }} />}
                    datum={(datum: any) => 
                      `${datum.x}\n${datum.y} invoices\n$${datum.amount.toLocaleString()}\n${((datum.y / totalCount) * 100).toFixed(1)}%`
                    }
                  />
                }
              />
            </Box>
            <Box sx={{ ml: 2, minWidth: 120 }}>
              <Typography variant="subtitle2" gutterBottom>
                Legend
              </Typography>
              {data.map((item) => (
                <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CircleIcon 
                    sx={{ 
                      fontSize: 12, 
                      color: getStatusColor(item.status),
                      mr: 1 
                    }} 
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: 11 }}>
                      {getStatusLabel(item.status)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {item.count} ({((item.count / totalCount) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <List dense>
              {data.map((item) => (
                <ListItem key={item.status} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CircleIcon 
                      sx={{ 
                        fontSize: 16, 
                        color: getStatusColor(item.status) 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {getStatusLabel(item.status)}
                        </Typography>
                        <Chip 
                          label={item.count} 
                          size="small" 
                          color={item.status === 'paid' ? 'success' : item.status === 'overdue' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption">
                          ${item.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">
                          {((item.count / totalCount) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Total: {totalCount} invoices • ${totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default InvoiceStatus;