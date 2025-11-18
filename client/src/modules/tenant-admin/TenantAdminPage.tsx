import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import UserManagement from './UserManagement';
import BillingSection from './BillingSection';

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Administration
            </Typography>
          }
          subheader="Manage your tenant's users and billing settings"
        />
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="User Management" />
            <Tab label="Billing & Subscription" />
          </Tabs>

          <Box sx={{ mt: 2, p: 2 }}>
            {tabValue === 0 && <UserManagement />}
            {tabValue === 1 && <BillingSection />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;