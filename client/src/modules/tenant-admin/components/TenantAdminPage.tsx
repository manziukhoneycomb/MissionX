import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import UserManagementSection from './UserManagementSection';
import BillingSection from './BillingSection';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

const a11yProps = (index: number) => {
  return {
    id: `tenant-admin-tab-${index}`,
    'aria-controls': `tenant-admin-tabpanel-${index}`,
  };
};

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Tenant Administration
      </Typography>
      
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="tenant admin tabs"
            sx={{ px: 2 }}
          >
            <Tab label="User Management" {...a11yProps(0)} />
            <Tab label="Billing & Subscription" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TabPanel value={tabValue} index={0}>
            <UserManagementSection />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <BillingSection />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;