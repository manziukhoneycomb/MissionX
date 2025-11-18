import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  useTheme,
} from '@mui/material';
import UserManagementTab from './components/UserManagementTab';
import BillingManagementTab from './components/BillingManagementTab';

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
      aria-labelledby={`tenant-admin-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, pt: 3, pb: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Tenant Administration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your tenant's users and billing settings
            </Typography>
          </Box>

          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              px: 3,
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

          <TabPanel value={currentTab} index={0}>
            <UserManagementTab />
          </TabPanel>
          
          <TabPanel value={currentTab} index={1}>
            <BillingManagementTab />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;