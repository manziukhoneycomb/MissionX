import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
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
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { Team } from '../types/team';
import TeamForm from './TeamForm';
import TeamMembersDialog from './TeamMembersDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { useGetTeams } from '../teamQueries';
import { useDeleteTeam } from '../teamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';

const TeamManagementPage: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useUserRoles();

  const {
    isFormOpen,
    selectedTeam,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    isMembersDialogOpen,
    selectedTeamForMembers,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openMembersDialog,
    closeMembersDialog,
  } = useTeamManagementStore();

  const { data: teams = [], isLoading, error: teamsError } = useGetTeams();

  const { mutateAsync: deleteTeamMutate, isPending: isDeleting } = useDeleteTeam();

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const handleDelete = async (): Promise<void> => {
    if (!teamToDeleteId) return;

    try {
      await deleteTeamMutate(teamToDeleteId);
      resetDeleteState();
    } catch {
      // Error is handled by the mutation
    }
  };

  const canManageTeams = hasRole([ROLES.ADMIN, ROLES.SUPER_ADMIN]);

  return (
    <Box>
      <Card>
        <CardHeader
          title="Team Management"
          action={
            canManageTeams && (
              <Button variant="contained" onClick={openCreateForm}>
                Create Team
              </Button>
            )
          }
        />
        <CardContent>
          {isLoading ? (
            <Stack alignItems="center" padding={4}>
              <CircularProgress />
            </Stack>
          ) : teams.length === 0 ? (
            <Typography variant="body1" align="center" color="text.secondary">
              No teams found
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Members</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                    {canManageTeams && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team: Team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell align="center">{team.userCount}</TableCell>
                      <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(team.updatedAt).toLocaleDateString()}</TableCell>
                      {canManageTeams && (
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Manage Members">
                              <IconButton
                                size="small"
                                onClick={() => openMembersDialog(team)}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                <GroupIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditForm(team)}
                                sx={{ color: theme.palette.primary.main }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => openConfirmDeleteDialog(team.id)}
                                sx={{ color: theme.palette.error.main }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <TeamForm open={isFormOpen} team={selectedTeam} onClose={closeForm} />

      {selectedTeamForMembers && (
        <TeamMembersDialog
          open={isMembersDialogOpen}
          team={selectedTeamForMembers}
          onClose={closeMembersDialog}
        />
      )}

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        title="Delete Team"
        content="Are you sure you want to delete this team? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={closeConfirmDeleteDialog}
        loading={isDeleting}
      />
    </Box>
  );
};

export default TeamManagementPage;