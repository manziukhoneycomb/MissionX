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
import GroupIcon from '@mui/icons-material/Group';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import UserManagement from './UserManagement';
import BillingSection from './BillingSection';

type TabValue = 'users' | 'billing';

interface TabPanelProps {
  children?: React.ReactNode;
  index: TabValue;
  value: TabValue;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-admin-tabpanel-${index}`}
      aria-labelledby={`tenant-admin-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabValue>('users');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
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
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Administration
            </Typography>
          }
          subheader="Manage users and billing for your tenant"
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="tenant admin tabs"
              sx={{
                px: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 0,
                  fontWeight: 'medium',
                },
              }}>
              <Tab
                icon={<GroupIcon />}
                iconPosition="start"
                label="User Management"
                value="users"
                id="tenant-admin-tab-users"
                aria-controls="tenant-admin-tabpanel-users"
              />
              <Tab
                icon={<CreditCardIcon />}
                iconPosition="start"
                label="Billing & Subscription"
                value="billing"
                id="tenant-admin-tab-billing"
                aria-controls="tenant-admin-tabpanel-billing"
              />
            </Tabs>
          </Box>
          <TabPanel value={activeTab} index="users">
            <UserManagement />
          </TabPanel>
          <TabPanel value={activeTab} index="billing">
            <BillingSection />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;