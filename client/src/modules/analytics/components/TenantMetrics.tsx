import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Paper,
    LinearProgress,
} from '@mui/material';
import { TenantPerformance, DrillDownData } from '../types/analytics';

interface TenantMetricsProps {
    data: TenantPerformance[];
    onDrillDown?: (data: DrillDownData) => void;
}

const TenantMetrics: React.FC<TenantMetricsProps> = ({ data, onDrillDown }) => {
    if (!data || data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <Typography variant="body2" color="text.secondary">
                    No tenant performance data available
                </Typography>
            </Box>
        );
    }

    const sortedData = [...data]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

    const maxRevenue = Math.max(...sortedData.map(t => t.totalRevenue));

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const handleRowClick = (tenant: TenantPerformance) => {
        if (onDrillDown) {
            onDrillDown({
                type: 'tenant',
                filters: { tenantId: tenant.tenantId },
                data: tenant,
            });
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: '300px' }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tenant</TableCell>
                            <TableCell align="center">Invoices</TableCell>
                            <TableCell align="right">Revenue</TableCell>
                            <TableCell align="center">Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.map((tenant) => (
                            <TableRow
                                key={tenant.tenantId}
                                hover
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                                onClick={() => handleRowClick(tenant)}
                            >
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {tenant.tenantName}
                                        </Typography>
                                        <Box sx={{ mt: 0.5, mb: 0.5 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(tenant.totalRevenue / maxRevenue) * 100}
                                                sx={{
                                                    height: 4,
                                                    borderRadius: 2,
                                                    bgcolor: 'grey.200',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#1976d2',
                                                    },
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Avg: {formatCurrency(tenant.averageInvoiceValue)}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight="medium">
                                        {tenant.totalInvoices}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="medium">
                                        {formatCurrency(tenant.totalRevenue)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={`${tenant.paymentScore.toFixed(0)}%`}
                                        color={getScoreColor(tenant.paymentScore)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Click on rows for tenant-specific analytics
                </Typography>
            </Box>
        </Box>
    );
};

export default TenantMetrics;