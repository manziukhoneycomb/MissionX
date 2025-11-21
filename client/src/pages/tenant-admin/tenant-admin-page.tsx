import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
  Tab,
  Tabs,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import UserList from '../../components/tenant-admin/user-list/user-list';
import SubscriptionInfo from '../../components/tenant-admin/billing/subscription-info';
import PaymentMethodsList from '../../components/tenant-admin/billing/payment-methods-list';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-admin-tabpanel-${index}`}
      aria-labelledby={`tenant-admin-tab-${index}`}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <CardHeader
          title={
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Administration
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              Manage users and billing for your organization
            </Typography>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="tenant admin tabs">
              <Tab label="User Management" id="tenant-admin-tab-0" />
              <Tab label="Billing & Subscription" id="tenant-admin-tab-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3, pb: 3 }}>
              <UserList />
            </Box>
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3, pb: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Box sx={{ flex: 1 }}>
                  <SubscriptionInfo />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <PaymentMethodsList />
                </Box>
              </Stack>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;