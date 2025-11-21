import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  TablePagination,
} from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useTenantUsers } from '../../../hooks/use-tenant-users';
import UserListItem from './user-list-item';
import InviteUserDialog from '../invite-user-dialog/invite-user-dialog';
import { User } from '../../../modules/users/types/user';
import { StyledTableCell, StyledHeaderRow } from './user-list.styles';

const UserList: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useTenantUsers();

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'Failed to load users', {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const users: User[] = usersData?.data ?? [];
  
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenInviteDialog = () => {
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };

  const handleUserInvited = () => {
    refetch();
    handleCloseInviteDialog();
    enqueueSnackbar('User invitation sent successfully', { variant: 'success' });
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Tenant Users
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenInviteDialog}
          sx={{
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
          }}>
          + Invite User
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <StyledHeaderRow>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Roles</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Created</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </StyledHeaderRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No users found in this tenant.
                </StyledTableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  onUserUpdated={() => refetch()}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '& .MuiTablePagination-toolbar': {
            color: theme.palette.text.primary,
          },
        }}
      />

      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={handleCloseInviteDialog}
        onUserInvited={handleUserInvited}
      />
    </Box>
  );
};

export default UserList;