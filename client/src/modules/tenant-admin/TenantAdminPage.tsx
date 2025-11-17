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
import GroupIcon from '@mui/icons-material/Group';
import PaymentIcon from '@mui/icons-material/Payment';
import UserManagementSection from './UserManagementSection';
import BillingSection from './BillingSection';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-admin-tabpanel-${index}`}
      aria-labelledby={`tenant-admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tenant-admin-tab-${index}`,
    'aria-controls': `tenant-admin-tabpanel-${index}`,
  };
}

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100%' }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ px: 3, pt: 3, pb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Tenant Administration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and billing for your tenant
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 60,
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 'medium',
                },
              }}
            >
              <Tab
                icon={<GroupIcon />}
                iconPosition="start"
                label="User Management"
                {...a11yProps(0)}
                sx={{
                  gap: 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <Tab
                icon={<PaymentIcon />}
                iconPosition="start"
                label="Billing & Subscription"
                {...a11yProps(1)}
                sx={{
                  gap: 1,
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            </Tabs>
          </Box>

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