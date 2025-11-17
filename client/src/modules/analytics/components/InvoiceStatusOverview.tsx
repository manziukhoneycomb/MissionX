import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import {
    VictoryPie,
    VictoryContainer,
    VictoryTooltip,
    VictoryTheme,
} from 'victory';
import { InvoiceStatusOverview as InvoiceStatus, DrillDownData } from '../types/analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';

interface InvoiceStatusOverviewProps {
    data: InvoiceStatus;
    onDrillDown?: (data: DrillDownData) => void;
}

const InvoiceStatusOverview: React.FC<InvoiceStatusOverviewProps> = ({ data, onDrillDown }) => {
    if (!data || data.total === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                <Typography variant="body2" color="text.secondary">
                    No invoice status data available
                </Typography>
            </Box>
        );
    }

    const pieData = [
        {
            x: 'Paid',
            y: data.paid,
            fill: '#4caf50',
        },
        {
            x: 'Unpaid',
            y: data.unpaid,
            fill: '#ff9800',
        },
        {
            x: 'Overdue',
            y: data.overdue,
            fill: '#f44336',
        },
    ].filter(item => item.y > 0);

    const statusCards = [
        {
            label: 'Paid',
            value: data.paid,
            color: '#4caf50',
            icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
            percentage: ((data.paid / data.total) * 100).toFixed(1),
        },
        {
            label: 'Unpaid',
            value: data.unpaid,
            color: '#ff9800',
            icon: <PendingIcon sx={{ color: '#ff9800' }} />,
            percentage: ((data.unpaid / data.total) * 100).toFixed(1),
        },
        {
            label: 'Overdue',
            value: data.overdue,
            color: '#f44336',
            icon: <ErrorIcon sx={{ color: '#f44336' }} />,
            percentage: ((data.overdue / data.total) * 100).toFixed(1),
        },
    ];

    const handleSliceClick = (evt: any, data: any) => {
        if (onDrillDown) {
            onDrillDown({
                type: 'status',
                filters: {},
                data: { status: data.datum.x, count: data.datum.y },
            });
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <VictoryPie
                            data={pieData}
                            theme={VictoryTheme.material}
                            width={200}
                            height={200}
                            innerRadius={50}
                            padAngle={3}
                            containerComponent={<VictoryContainer responsive />}
                            labelComponent={<VictoryTooltip />}
                            animate={{
                                duration: 1000,
                                onLoad: { duration: 500 },
                            }}
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
                                        onClick: handleSliceClick,
                                    },
                                },
                            ]}
                        />
                    </Box>
                </Grid>

                {statusCards.map((card) => (
                    <Grid item xs={4} key={card.label}>
                        <Card
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                            onClick={() => onDrillDown && onDrillDown({
                                type: 'status',
                                filters: {},
                                data: { status: card.label, count: card.value },
                            })}
                        >
                            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                                {card.icon}
                                <Typography variant="h6" component="div">
                                    {card.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {card.label}
                                </Typography>
                                <Typography variant="body2" sx={{ color: card.color, fontWeight: 'bold' }}>
                                    {card.percentage}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Total Invoices: {data.total}
                </Typography>
            </Box>
        </Box>
    );
};

export default InvoiceStatusOverview;