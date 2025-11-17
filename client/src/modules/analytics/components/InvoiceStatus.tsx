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
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as PaidIcon,
  Schedule as UnpaidIcon,
  Error as OverdueIcon,
} from '@mui/icons-material';
import { InvoiceStatusData } from '../services/analyticsService';

interface InvoiceStatusProps {
  data?: InvoiceStatusData;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ data }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
        bgcolor={alpha(theme.palette.grey[100], 0.1)}
        borderRadius={1}
      >
        No invoice status data available
      </Box>
    );
  }

  const total = data.paid + data.unpaid + data.overdue;
  
  const chartData = [
    {
      x: 'Paid',
      y: data.paid,
      percentage: total > 0 ? Math.round((data.paid / total) * 100) : 0,
    },
    {
      x: 'Unpaid',
      y: data.unpaid,
      percentage: total > 0 ? Math.round((data.unpaid / total) * 100) : 0,
    },
    {
      x: 'Overdue',
      y: data.overdue,
      percentage: total > 0 ? Math.round((data.overdue / total) * 100) : 0,
    },
  ];

  const colorScale = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (format === 'csv') {
      const csvData = chartData
        .map(item => `${item.x},${item.y},${item.percentage}%`)
        .join('\n');
      const blob = new Blob([`Status,Count,Percentage\n${csvData}`], {
        type: 'text/csv',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoice-status.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const svgElement = document.querySelector('.invoice-status-chart svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        if (format === 'svg') {
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'invoice-status.svg';
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'png') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'invoice-status.png';
                a.click();
                URL.revokeObjectURL(url);
              }
            });
          };
          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }
      }
    }
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Tooltip title="Export Chart">
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box className="invoice-status-chart" display="flex" justifyContent="center">
            <VictoryPie
              data={chartData}
              theme={VictoryTheme.material}
              width={280}
              height={200}
              innerRadius={60}
              padAngle={3}
              colorScale={colorScale}
              labelComponent={
                <VictoryTooltip
                  style={{
                    fill: theme.palette.background.paper,
                    stroke: theme.palette.divider,
                  }}
                />
              }
              labelRadius={({ innerRadius }) => innerRadius as number + 30 }
              animate={{
                duration: 1000,
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: 'data',
                          mutation: (props) => {
                            const fill = props.style && props.style.fill;
                            return fill === '#c43a31' ? null : { style: { fill: '#c43a31' } };
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={0.5}>
                    <PaidIcon sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary">
                      Paid
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {data.paid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chartData[0].percentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={0.5}>
                    <UnpaidIcon sx={{ color: theme.palette.warning.main, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary">
                      Unpaid
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    {data.unpaid}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chartData[1].percentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={4}>
              <Card 
                sx={{ 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box display="flex" alignItems="center" justifyContent="center" mb={0.5}>
                    <OverdueIcon sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: 16 }} />
                    <Typography variant="caption" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    {data.overdue}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {chartData[2].percentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" align="center">
            Total Invoices: <strong>{total}</strong>
          </Typography>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('png')}>Export as PNG</MenuItem>
        <MenuItem onClick={() => handleExport('svg')}>Export as SVG</MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>Export Data as CSV</MenuItem>
      </Menu>
    </Box>
  );
};

export default InvoiceStatus;