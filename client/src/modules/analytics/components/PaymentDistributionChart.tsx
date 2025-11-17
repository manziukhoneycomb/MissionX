import React from 'react';
import { Box, Typography } from '@mui/material';
import {
    VictoryChart,
    VictoryBar,
    VictoryAxis,
    VictoryTooltip,
    VictoryTheme,
    VictoryContainer,
} from 'victory';
import { PaymentDistribution, DrillDownData } from '../types/analytics';

interface PaymentDistributionChartProps {
    data: PaymentDistribution[];
    onDrillDown?: (data: DrillDownData) => void;
}

const PaymentDistributionChart: React.FC<PaymentDistributionChartProps> = ({ data, onDrillDown }) => {
    if (!data || data.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <Typography variant="body2" color="text.secondary">
                    No payment distribution data available
                </Typography>
            </Box>
        );
    }

    const chartData = data.map((item, index) => ({
        x: index + 1,
        y: item.amount,
        category: item.category,
        count: item.count,
        percentage: item.percentage,
    }));

    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f'];

    const handleBarClick = (evt: any, data: any) => {
        if (onDrillDown) {
            const originalItem = data.data[data.index];
            onDrillDown({
                type: 'payment',
                filters: {},
                data: originalItem,
            });
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <VictoryChart
                theme={VictoryTheme.material}
                height={320}
                width={500}
                containerComponent={<VictoryContainer responsive />}
                padding={{ left: 80, top: 20, right: 80, bottom: 80 }}
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
                    tickFormat={(index) => {
                        const category = chartData[index - 1]?.category || '';
                        return category.length > 10 ? category.substring(0, 10) + '...' : category;
                    }}
                    style={{
                        tickLabels: { fontSize: 10, padding: 5, fill: '#666', angle: -45 },
                    }}
                />

                <VictoryBar
                    data={chartData}
                    style={{
                        data: {
                            fill: (datum, index) => colors[index % colors.length],
                            strokeWidth: 0,
                        },
                    }}
                    animate={{
                        duration: 1000,
                        onLoad: { duration: 500 },
                    }}
                    labelComponent={
                        <VictoryTooltip
                            flyoutStyle={{ fill: 'white', stroke: '#666', strokeWidth: 1 }}
                            style={{ fontSize: 12, fill: '#333' }}
                            renderInPortal={false}
                        />
                    }
                    events={[
                        {
                            target: 'data',
                            eventHandlers: {
                                onMouseOver: () => [
                                    {
                                        target: 'data',
                                        mutation: (props) => ({
                                            style: {
                                                ...props.style,
                                                fillOpacity: 0.8,
                                                stroke: '#333',
                                                strokeWidth: 2,
                                            },
                                        }),
                                    },
                                ],
                                onMouseOut: () => [
                                    {
                                        target: 'data',
                                        mutation: () => ({}),
                                    },
                                ],
                                onClick: handleBarClick,
                            },
                        },
                    ]}
                />
            </VictoryChart>

            <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Click on bars for detailed breakdown
                </Typography>
            </Box>
        </Box>
    );
};

export default PaymentDistributionChart;