import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    VictoryChart,
    VictoryLine,
    VictoryArea,
    VictoryAxis,
    VictoryTooltip,
    VictoryTheme,
    VictoryContainer,
} from 'victory';
import { RevenueMetric, DrillDownData } from '../types/analytics';

interface RevenueChartProps {
    data: RevenueMetric[];
    onDrillDown?: (data: DrillDownData) => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, onDrillDown }) => {
    if (!data || data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <Typography variant="body2" color="text.secondary">
                    No revenue data available
                </Typography>
            </Box>
        );
    }

    const chartData = data.map((item, index) => ({
        x: index + 1,
        y: item.totalRevenue,
        period: item.period,
        invoiceCount: item.invoiceCount,
        averageValue: item.averageInvoiceValue,
    }));

    const handlePointClick = (evt: any, data: any) => {
        if (onDrillDown) {
            const originalItem = data.data[data.index];
            onDrillDown({
                type: 'revenue',
                filters: { dateRange: undefined },
                data: originalItem,
            });
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <VictoryChart
                theme={VictoryTheme.material}
                height={320}
                width={600}
                containerComponent={<VictoryContainer responsive />}
                padding={{ left: 80, top: 20, right: 80, bottom: 60 }}
            >
                <VictoryAxis
                    dependentAxis
                    tickFormat={(value) => `$${(value / 1000).toFixed(0)}K`}
                    style={{
                        tickLabels: { fontSize: 12, padding: 5, fill: '#666' },
                        grid: { stroke: '#e0e0e0', strokeWidth: 1 },
                    }}
                />
                <VictoryAxis
                    tickFormat={(index) => chartData[index - 1]?.period || ''}
                    style={{
                        tickLabels: { fontSize: 12, padding: 5, fill: '#666', angle: -45 },
                    }}
                />
                
                <VictoryArea
                    data={chartData}
                    style={{
                        data: { fill: 'rgba(25, 118, 210, 0.1)', stroke: '#1976d2', strokeWidth: 2 },
                    }}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 500 },
                    }}
                />
                
                <VictoryLine
                    data={chartData}
                    style={{
                        data: { stroke: '#1976d2', strokeWidth: 3 },
                    }}
                    labelComponent={<VictoryTooltip />}
                    events={[
                        {
                            target: 'data',
                            eventHandlers: {
                                onMouseOver: () => [
                                    {
                                        target: 'data',
                                        mutation: () => ({
                                            style: { fill: '#1976d2', stroke: '#1976d2', strokeWidth: 4 },
                                        }),
                                    },
                                ],
                                onMouseOut: () => [
                                    {
                                        target: 'data',
                                        mutation: () => ({}),
                                    },
                                ],
                                onClick: handlePointClick,
                            },
                        },
                    ]}
                />
            </VictoryChart>
            
            <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Click on data points for detailed breakdown
                </Typography>
            </Box>
        </Box>
    );
};

export default RevenueChart;