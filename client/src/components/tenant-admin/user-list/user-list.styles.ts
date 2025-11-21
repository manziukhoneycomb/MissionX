import { styled } from '@mui/material/styles';
import { TableCell, TableRow } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

export const StyledHeaderRow = styled(TableRow)(({ theme }) => ({
  '& th': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.secondary,
    fontWeight: 'bold',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));