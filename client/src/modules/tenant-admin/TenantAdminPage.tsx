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
import useUserRoles from '../../common/hooks/useUserRoles';
import { ROLES } from '../../common/constants/roles';
import TenantUserManagement from './components/TenantUserManagement';
import TenantBillingManagement from './components/TenantBillingManagement';

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
  const userRoles = useUserRoles();
  const [tabValue, setTabValue] = useState(0);

  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

  if (!isAdmin && !isSuperAdmin) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          subheader={
            <Typography variant="body2" color="text.secondary">
              Manage users and billing for your tenant
            </Typography>
          }
        />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tenant admin tabs">
            <Tab label="User Management" {...a11yProps(0)} />
            <Tab label="Billing & Subscriptions" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TabPanel value={tabValue} index={0}>
            <TenantUserManagement />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <TenantBillingManagement />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TenantAdminPage;