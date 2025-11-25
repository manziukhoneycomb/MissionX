import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery } from '@tanstack/react-query';
import { Team } from '../types/team';
import TeamForm from '../components/TeamForm';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { useTeams } from '../teamQueries';
import { useDeleteTeam, useAddTeamMember, useRemoveTeamMember } from '../teamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { getUsers } from '../../users/userQueries';
import { USER_QUERY_KEYS } from '../../users/userQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

type TeamManagementPageProps = Record<string, unknown>;

const TeamManagementPage: React.FC<TeamManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const {
    isFormOpen,
    selectedTeamId,
    formMode,
    isMemberDialogOpen,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    openCreateForm,
    openEditForm,
    closeForm,
    openMemberDialog,
    closeMemberDialog,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
  } = useTeamManagementStore();

  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const {
    data: teams = [],
    isLoading,
    error: teamsError,
  } = useTeams();

  const { data: usersData } = useQuery({
    queryKey: [USER_QUERY_KEYS.GET_USERS],
    queryFn: getUsers,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  const users = usersData?.data ?? [];

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const { mutateAsync: deleteTeamMutate, isPending: isDeleting } = useDeleteTeam();
  const { mutateAsync: addMemberMutate, isPending: isAddingMember } = useAddTeamMember();
  const { mutateAsync: removeMemberMutate, isPending: isRemovingMember } = useRemoveTeamMember();

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleConfirmDelete = async (): Promise<void> => {
    if (teamToDeleteId === null) return;

    try {
      await deleteTeamMutate(teamToDeleteId);
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to delete team',
        { variant: 'error' }
      );
    } finally {
      resetDeleteState();
    }
  };

  const handleAddMember = async (): Promise<void> => {
    if (!selectedTeamId || !selectedUserId) return;

    try {
      await addMemberMutate({ teamId: selectedTeamId, data: { userId: selectedUserId } });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
      setSelectedUserId('');
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to add member',
        { variant: 'error' }
      );
    }
  };

  const handleRemoveMember = async (userId: string): Promise<void> => {
    if (!selectedTeamId) return;

    try {
      await removeMemberMutate({ teamId: selectedTeamId, userId });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to remove member',
        { variant: 'error' }
      );
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';

    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const availableUsers = users.filter(
    (user) => !selectedTeam?.members.some((member) => member.id === user.id)
  );

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
              Team Management
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={openCreateForm}
              sx={{
                backgroundColor: theme.palette.primary.main,
                '&:hover': { backgroundColor: theme.palette.primary.dark },
              }}>
              + Create Team
            </Button>
          }
        />
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!isLoading && (
            <TableContainer>
              <Table stickyHeader aria-label="team table">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.secondary,
                        fontWeight: 'bold',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      },
                    }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  sx={{
                    '& tr': {
                      '&:hover': {},
                    },
                    '& td, & th': {
                      color: theme.palette.text.primary,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1,
                    },
                    '& tr:last-child td, & tr:last-child th': {
                      borderBottom: 0,
                    },
                  }}>
                  {teams.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No teams found. Create your first team to get started.
                      </TableCell>
                    </TableRow>
                  )}
                  {teams.map((team: Team) => (
                    <TableRow key={team.id}>
                      <TableCell component="th" scope="row">
                        {team.name}
                      </TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>{team.members?.length || 0}</TableCell>
                      <TableCell>{formatDate(team.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Members">
                          <IconButton
                            onClick={() => openMemberDialog(team.id)}
                            size="small"
                            color="info"
                            sx={{ mr: 0.5 }}>
                            <GroupIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Team">
                          <IconButton
                            onClick={() => openEditForm(team)}
                            size="small"
                            color="primary"
                            sx={{ mr: 0.5 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Team">
                          <IconButton
                            onClick={() => openConfirmDeleteDialog(team.id)}
                            size="small"
                            color="error"
                            disabled={isDeleting && teamToDeleteId === team.id}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {formMode === 'edit' ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TeamForm team={selectedTeam} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMemberDialogOpen}
        onClose={closeMemberDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}>
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          Manage Team Members - {selectedTeam?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add Member
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              <FormControl fullWidth>
                <InputLabel id="user-select-label">Select User</InputLabel>
                <Select
                  labelId="user-select-label"
                  value={selectedUserId}
                  label="Select User"
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isAddingMember}>
                  <MenuItem value="">
                    <em>Select a user</em>
                  </MenuItem>
                  {availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.email} - {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddMember}
                disabled={!selectedUserId || isAddingMember}>
                {isAddingMember ? <CircularProgress size={24} /> : 'Add'}
              </Button>
            </Box>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Members ({selectedTeam?.members?.length || 0})
            </Typography>
            {selectedTeam?.members && selectedTeam.members.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTeam.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.firstName || member.lastName
                            ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                            : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isRemovingMember}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No members yet.</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={closeMemberDialog}>Close</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete this team? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />
    </Box>
  );
};

export default TeamManagementPage;
