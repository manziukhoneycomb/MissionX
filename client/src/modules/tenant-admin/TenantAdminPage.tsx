import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import PaymentIcon from '@mui/icons-material/Payment';
import UserManagement from './components/UserManagement';
import BillingDashboard from './components/BillingDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tenant-admin-tabpanel-${index}`}
      aria-labelledby={`tenant-admin-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TenantAdminPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          minHeight: '80vh',
        }}
      >
        <CardHeader
          title={
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Tenant Administration
            </Typography>
          }
          subheader={
            <Typography variant="body1" color="text.secondary">
              Manage users, invitations, and billing for your tenant
            </Typography>
          }
        />
        
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tenant admin tabs"
              sx={{ px: 3 }}
            >
              <Tab
                icon={<GroupIcon />}
                iconPosition="start"
                label="User Management"
                id="tenant-admin-tab-0"
                aria-controls="tenant-admin-tabpanel-0"
              />
              <Tab
                icon={<PaymentIcon />}
                iconPosition="start"
                label="Billing & Payments"
                id="tenant-admin-tab-1"
                aria-controls="tenant-admin-tabpanel-1"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <UserManagement />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <BillingDashboard />
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TenantAdminPage;