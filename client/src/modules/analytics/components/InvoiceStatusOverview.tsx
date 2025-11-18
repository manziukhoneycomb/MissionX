import React from 'react';
import { Box, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { InvoiceStatusOverview as InvoiceStatusData } from '../types/analytics';

interface InvoiceStatusOverviewProps {
  data?: InvoiceStatusData;
}

const InvoiceStatusOverview: React.FC<InvoiceStatusOverviewProps> = ({ data }) => {
  if (!data) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography color="text.secondary">No invoice status data available</Typography>
      </Box>
    );
  }

  const statusItems = [
    {
      label: 'Paid',
      count: data.paid,
      percentage: data.paidPercentage,
      color: '#4caf50',
      icon: <CheckCircleOutlineIcon />,
    },
    {
      label: 'Unpaid',
      count: data.unpaid,
      percentage: data.unpaidPercentage,
      color: '#ff9800',
      icon: <HourglassEmptyIcon />,
    },
    {
      label: 'Overdue',
      count: data.overdue,
      percentage: data.overduePercentage,
      color: '#f44336',
      icon: <ErrorOutlineIcon />,
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {data.total.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Invoices
          </Typography>
        </Box>
      </Box>

      <Stack spacing={3} sx={{ flexGrow: 1 }}>
        {statusItems.map((item) => (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  {item.label}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip
                  label={`${item.count} (${item.percentage.toFixed(1)}%)`}
                  size="small"
                  sx={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    fontWeight: 'medium',
                  }}
                />
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${item.color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: item.color,
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ))}
      </Stack>

      {data.total > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>{((data.paid / data.total) * 100).toFixed(1)}%</strong> of invoices are paid
            {data.overdue > 0 && (
              <>
                {' • '}
                <strong style={{ color: '#f44336' }}>
                  {((data.overdue / data.total) * 100).toFixed(1)}%
                </strong>{' '}
                are overdue
              </>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceStatusOverview;