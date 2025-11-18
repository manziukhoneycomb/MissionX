import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';
import { format, parseISO } from 'date-fns';

interface RevenueData {
  period: string;
  revenue: number;
  previousPeriodRevenue?: number;
}

interface RevenueMetrics {
  monthlyTrends: RevenueData[];
  quarterlyTrends: RevenueData[];
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalRevenue: number;
    invoiceCount: number;
  }>;
}

interface RevenueChartProps {
  data: RevenueMetrics;
  onExport: () => void;
}

type TimePeriod = 'monthly' | 'quarterly';

const SimpleRevenueChart: React.FC<RevenueChartProps> = ({ data, onExport }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const currentData = timePeriod === 'monthly' ? data.monthlyTrends : data.quarterlyTrends;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: TimePeriod | null,
  ) => {
    if (newPeriod !== null) {
      setTimePeriod(newPeriod);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Revenue Trends
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <ToggleButtonGroup
              value={timePeriod}
              exclusive
              onChange={handleTimePeriodChange}
              size="small"
            >
              <ToggleButton value="monthly">Monthly</ToggleButton>
              <ToggleButton value="quarterly">Quarterly</ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ height: 400, width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 20 }}>
            Revenue Chart Placeholder
            <br />
            (Victory charts require proper configuration)
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Summary ({timePeriod} view)
          </Typography>
          <Box display="flex" gap={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="h6">
                ${currentData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Average
              </Typography>
              <Typography variant="h6">
                ${Math.round(currentData.reduce((sum, item) => sum + item.revenue, 0) / currentData.length).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Peak Period
              </Typography>
              <Typography variant="h6">
                {currentData.length > 0 && 
                  format(parseISO(currentData.reduce((max, item) => item.revenue > max.revenue ? item : max).period), 
                  timePeriod === 'monthly' ? 'MMM yyyy' : 'QQQ yyyy')}
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

export default SimpleRevenueChart;