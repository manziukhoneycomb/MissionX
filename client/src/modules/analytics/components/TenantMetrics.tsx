import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  VictoryPie,
  VictoryTooltip,
  VictoryContainer,
  VictoryTheme,
} from 'victory';
import { TenantPerformanceMetrics } from '../types/analytics';

interface TenantMetricsProps {
  readonly data: TenantPerformanceMetrics;
}

const ExpandMore = styled((props: { expand: boolean; onClick: () => void; children: React.ReactNode }) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const pieData = data.tenantDistribution.map((item, index) => ({
    x: item.tenantName,
    y: item.revenue,
    label: `${item.tenantName}\n$${item.revenue.toLocaleString()}\n${item.percentage.toFixed(1)}%`,
  }));

  const colorScale = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#9c27b0',
    '#ff5722',
    '#607d8b',
    '#795548',
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

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
              Tenant Performance
            </Typography>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more">
              <ExpandMoreIcon />
            </ExpandMore>
          </Box>
        }
        subheader={
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Tenants: {data.totalTenants}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Invoice Value: {formatCurrency(data.averageInvoiceValue)}
            </Typography>
          </Box>
        }
      />
      <CardContent sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
        <Collapse in={!expanded} timeout="auto" unmountOnExit>
          <Box sx={{ height: '350px', display: 'flex', justifyContent: 'center' }}>
            <VictoryPie
              data={pieData}
              theme={VictoryTheme.material}
              colorScale={colorScale}
              containerComponent={
                <VictoryContainer style={{ pointerEvents: 'auto' }} responsive={true} />
              }
              innerRadius={60}
              padAngle={2}
              labelRadius={({ innerRadius }) => innerRadius as number + 80}
              style={{
                labels: { fontSize: 11, fill: theme.palette.text.primary },
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
        </Collapse>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} sx={{ maxHeight: '350px' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tenant</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Invoices</TableCell>
                  <TableCell align="right">Avg Value</TableCell>
                  <TableCell align="center">Timeliness</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.topTenants.map((tenant, index) => (
                  <TableRow key={tenant.tenantId}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" noWrap>
                        {tenant.tenantName}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(tenant.totalRevenue)}
                    </TableCell>
                    <TableCell align="right">
                      {tenant.invoiceCount}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(tenant.averageInvoiceValue)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${tenant.paymentTimeliness}%`}
                        size="small"
                        color={tenant.paymentTimeliness >= 90 ? 'success' : tenant.paymentTimeliness >= 70 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TenantMetrics;