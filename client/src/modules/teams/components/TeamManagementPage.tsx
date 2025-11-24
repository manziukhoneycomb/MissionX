import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import TeamForm from './TeamForm';
import TeamMembersDialog from './TeamMembersDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { useGetTeams } from '../teamQueries';
import { useDeleteTeam } from '../teamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';

const TeamManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    isFormOpen,
    selectedTeam,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    isMembersDialogOpen,
    teamForMembersManagement,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openMembersDialog,
    closeMembersDialog,
  } = useTeamManagementStore();

  const {
    data: teams,
    isLoading,
    error: teamsError,
  } = useGetTeams();

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar('Failed to load teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const { mutateAsync: deleteTeamMutate } = useDeleteTeam();

  const handleConfirmDelete = async (): Promise<void> => {
    if (teamToDeleteId === null) return;

    try {
      await deleteTeamMutate(teamToDeleteId);
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete team', { variant: 'error' });
    }
    resetDeleteState();
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={0}>
        <CardHeader
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Teams</Typography>
              <Button variant="contained" color="primary" onClick={openCreateForm}>
                Create Team
              </Button>
            </Box>
          }
        />
        <CardContent>
          {teams && teams.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Tenant</TableCell>
                    <TableCell align="center">Members</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>
                        <Chip label={team.tenant.name} size="small" />
                      </TableCell>
                      <TableCell align="center">{team.members.length}</TableCell>
                      <TableCell>{formatDate(team.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Manage Members">
                            <IconButton
                              size="small"
                              onClick={() => openMembersDialog(team)}
                              color="primary"
                            >
                              <GroupIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Team">
                            <IconButton
                              size="small"
                              onClick={() => openEditForm(team)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Team">
                            <IconButton
                              size="small"
                              onClick={() => openConfirmDeleteDialog(team.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No teams found. Create one to get started.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={false}
      >
        <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          <TeamForm onClose={closeForm} team={selectedTeam} />
        </DialogContent>
      </Dialog>

      {teamForMembersManagement && (
        <TeamMembersDialog
          open={isMembersDialogOpen}
          onClose={closeMembersDialog}
          team={teamForMembersManagement}
        />
      )}

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
      />
    </Box>
  );
};

export default TeamManagementPage;