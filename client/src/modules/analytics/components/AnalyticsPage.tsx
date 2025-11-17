import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import { useAnalytics } from '../analyticsQueries';
import { DateRangeEnum, AnalyticsQuery, DrillDownData } from '../types/analytics';
import RevenueChart from './RevenueChart';
import TenantMetrics from './TenantMetrics';
import InvoiceStatusOverview from './InvoiceStatusOverview';
import PaymentDistributionChart from './PaymentDistributionChart';
import { ROLES } from '../../../common/constants/roles';

const AnalyticsPage: React.FC = () => {
    const { user } = useUser();
    const userRoles = (user?.publicMetadata?.roles as string[]) || [];
    const hasAccess = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

    const [query, setQuery] = useState<AnalyticsQuery>({
        dateRange: DateRangeEnum.LAST_30_DAYS,
    });

    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);

    const { data: analyticsData, isLoading, error } = useAnalytics(query);

    const handleDateRangeChange = (dateRange: DateRangeEnum) => {
        const newQuery = { ...query, dateRange };
        
        if (dateRange !== DateRangeEnum.CUSTOM) {
            delete newQuery.startDate;
            delete newQuery.endDate;
        }
        
        setQuery(newQuery);
    };

    const handleCustomDateApply = () => {
        if (customStartDate && customEndDate) {
            setQuery({
                ...query,
                dateRange: DateRangeEnum.CUSTOM,
                startDate: customStartDate.toISOString().split('T')[0],
                endDate: customEndDate.toISOString().split('T')[0],
            });
        }
    };

    const handleDrillDown = (drillData: DrillDownData) => {
        setDrillDownData(drillData);
    };

    const handleCloseDrillDown = () => {
        setDrillDownData(null);
    };

    if (!hasAccess) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" color="error" gutterBottom>
                        Access Denied
                    </Typography>
                    <Typography variant="body1">
                        You don't have permission to access the Analytics page. Please contact your
                        administrator.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">
                    Failed to load analytics data. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Analytics Dashboard
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filters
                </Typography>
                
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                value={query.dateRange || DateRangeEnum.LAST_30_DAYS}
                                label="Date Range"
                                onChange={(e) => handleDateRangeChange(e.target.value as DateRangeEnum)}
                            >
                                <MenuItem value={DateRangeEnum.LAST_30_DAYS}>Last 30 Days</MenuItem>
                                <MenuItem value={DateRangeEnum.LAST_90_DAYS}>Last 90 Days</MenuItem>
                                <MenuItem value={DateRangeEnum.LAST_6_MONTHS}>Last 6 Months</MenuItem>
                                <MenuItem value={DateRangeEnum.LAST_YEAR}>Last Year</MenuItem>
                                <MenuItem value={DateRangeEnum.CUSTOM}>Custom Range</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {query.dateRange === DateRangeEnum.CUSTOM && (
                        <>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Button
                                    variant="contained"
                                    onClick={handleCustomDateApply}
                                    disabled={!customStartDate || !customEndDate}
                                    fullWidth
                                >
                                    Apply Date Range
                                </Button>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>

            {analyticsData && (
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" gutterBottom>
                                Revenue Trends
                            </Typography>
                            <RevenueChart
                                data={analyticsData.revenueMetrics}
                                onDrillDown={handleDrillDown}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" gutterBottom>
                                Invoice Status Overview
                            </Typography>
                            <InvoiceStatusOverview
                                data={analyticsData.invoiceStatusOverview}
                                onDrillDown={handleDrillDown}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Distribution
                            </Typography>
                            <PaymentDistributionChart
                                data={analyticsData.paymentDistribution}
                                onDrillDown={handleDrillDown}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" gutterBottom>
                                Top Performing Tenants
                            </Typography>
                            <TenantMetrics
                                data={analyticsData.tenantPerformance}
                                onDrillDown={handleDrillDown}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                    Data generated at: {analyticsData ? new Date(analyticsData.generatedAt).toLocaleString() : ''}
                </Typography>
            </Box>
        </Container>
    );
};

export default AnalyticsPage;