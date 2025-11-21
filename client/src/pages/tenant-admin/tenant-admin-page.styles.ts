import { styled } from '@mui/material/styles';
import { Box, Card } from '@mui/material';

export const StyledTenantAdminContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

export const StyledTenantAdminCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  boxShadow: theme.shadows[1],
}));

export const TabPanelContainer = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));