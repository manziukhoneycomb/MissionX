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
  LinearProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';

interface PaymentDistribution {
  method: string;
  count: number;
  totalValue: number;
  percentage: number;
}

interface PaymentDistributionProps {
  data: PaymentDistribution[];
  onExport: () => void;
}

const SimplePaymentDistribution: React.FC<PaymentDistributionProps> = ({ data, onExport }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getMethodColor = (_method: string, index: number) => {
    const colors = [
      '#1976d2',
      '#388e3c',
      '#f57c00',
      '#7b1fa2',
      '#c2185b',
      '#00796b',
      '#5d4037',
      '#616161',
    ];
    return colors[index % colors.length];
  };

  const totalPayments = data.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Payment Methods
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
          {data.map((item, index) => (
            <ListItem key={item.method} sx={{ px: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getMethodColor(item.method, index),
                  mr: 2,
                }}
              />
              <ListItemText
                primary={
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2">
                        {item.method}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getMethodColor(item.method, index),
                        },
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {item.count} payments
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${item.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between">
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Total Payments
              </Typography>
              <Typography variant="h6">
                {totalPayments}
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
          
          <Box mt={1} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Average Payment
            </Typography>
            <Typography variant="h6">
              ${Math.round(totalValue / totalPayments).toLocaleString()}
            </Typography>
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

export default SimplePaymentDistribution;