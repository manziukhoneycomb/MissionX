import { styled } from '@mui/material/styles';
import { Card, ListItem } from '@mui/material';

export const StyledBillingCard = styled(Card)(({ theme }) => ({
  height: 'fit-content',
  '& .MuiCardHeader-title': {
    fontSize: '1.1rem',
    fontWeight: 600,
  },
  '& .MuiCardContent-root': {
    paddingTop: theme.spacing(1),
  },
}));

export const StyledBillingListItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  '& .MuiListItemIcon-root': {
    minWidth: 'auto',
    marginRight: theme.spacing(2),
  },
}));