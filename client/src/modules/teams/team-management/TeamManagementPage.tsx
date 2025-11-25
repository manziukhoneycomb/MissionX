import React, { useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import TeamForm from '../components/TeamForm';
import MemberManagementDialog from '../components/MemberManagementDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { getTeams } from '../teamQueries';
import { deleteTeam } from '../teamMutations';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

type TeamManagementPageProps = Record<string, unknown>;

const TeamManagementPage: React.FC<TeamManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const userRoles = useUserRoles();
  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);
  const canManage = isAdmin || isSuperAdmin;

  const {
    isFormOpen,
    selectedTeam,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    isMemberDialogOpen,
    selectedTeamForMembers,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openMemberDialog,
    closeMemberDialog,
  } = useTeamManagementStore();

  const {
    data: teamsData,
    isLoading,
    error: teamsError,
  } = useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS],
    queryFn: getTeams,
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const deleteMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
      resetDeleteState();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete team', { variant: 'error' });
    },
  });

  const handleConfirmDelete = () => {
    if (teamToDeleteId) {
      deleteMutation.mutate(teamToDeleteId);
    }
  };

  const teams = teamsData?.data || [];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Team Management"
          action={
            canManage && (
              <Button variant="contained" color="primary" onClick={openCreateForm}>
                Create Team
              </Button>
            )
          }
        />
        <CardContent>
          {teams.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No teams found. {canManage && 'Click "Create Team" to add one.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Created</TableCell>
                    {canManage && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team: Team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>{team.members?.length || 0}</TableCell>
                      <TableCell>{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                      {canManage && (
                        <TableCell align="right">
                          <Tooltip title="Manage Members">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => openMemberDialog(team)}
                            >
                              <GroupIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => openEditForm(team)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => openConfirmDeleteDialog(team.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
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

      <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          <TeamForm team={selectedTeam} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <MemberManagementDialog
        open={isMemberDialogOpen}
        team={selectedTeamForMembers}
        onClose={closeMemberDialog}
      />

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this team? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onClose={closeConfirmDeleteDialog}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{ disabled: deleteMutation.isPending }}
      />
    </Box>
  );
};

export default TeamManagementPage;
