import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';

interface InvoiceStatusData {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  percentage: number;
  totalValue: number;
}

interface AgingAnalysis {
  range: string;
  count: number;
  totalValue: number;
}

interface InvoiceStatusOverview {
  statusCounts: InvoiceStatusData[];
  agingAnalysis: AgingAnalysis[];
}

interface InvoiceStatusProps {
  data: InvoiceStatusOverview;
  onExport: () => void;
}

const SimpleInvoiceStatus: React.FC<InvoiceStatusProps> = ({ data, onExport }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'unpaid':
        return '#ff9800';
      case 'overdue':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'unpaid':
        return 'warning';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const totalInvoices = data.statusCounts.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.statusCounts.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Invoice Status
          </Typography>
          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ height: 280, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Pie Chart Placeholder
          </Typography>
        </Box>

        <List dense>
          {data.statusCounts.map((item) => (
            <ListItem key={item.status} sx={{ px: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(item.status),
                  mr: 2,
                }}
              />
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Typography>
                    <Chip
                      label={`${item.count} (${item.percentage}%)`}
                      size="small"
                      color={getStatusChipColor(item.status) as any}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={`$${item.totalValue.toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>

        {data.agingAnalysis.length > 0 && (
          <Box mt={2} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Aging Analysis (Unpaid/Overdue)
            </Typography>
            <List dense>
              {data.agingAnalysis.map((aging, index) => (
                <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">
                          {aging.range}
                        </Typography>
                        <Typography variant="caption" fontWeight="medium">
                          {aging.count} invoices
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        ${aging.totalValue.toLocaleString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between">
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
              <Typography variant="h6">
                {totalInvoices}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h6">
                ${totalValue.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onExport}>
          <GetAppIcon sx={{ mr: 1 }} />
          Export Data (CSV)
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default SimpleInvoiceStatus;