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
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../../types/team';
import TeamForm from '../TeamForm';
import ConfirmationDialog from '../../../../common/components/ConfirmationDialog';
import { getTeams } from '../../teamQueries';
import { deleteTeam } from '../../teamMutations';
import { CACHE_TIMES } from '../../../../common/constants/cacheTimes';
import { useTeamManagementStore } from '../../stores/teamManagementStore';
import { TEAM_QUERY_KEYS } from '../../teamQueryKeys';

type TeamManagementPageProps = Record<string, unknown>;

const TeamManagementPage: React.FC<TeamManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const {
    isFormOpen,
    selectedTeam,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
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
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching data', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const teams: Team[] = teamsData?.data ?? [];

  const { mutateAsync: removeTeamMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: (err: Error) => {
      enqueueSnackbar(err.message || 'Failed to delete team', {
        variant: 'error',
      });
    },
    onSettled: () => resetDeleteState(),
  });

  const handleConfirmDelete = async (): Promise<void> => {
    if (teamToDeleteId === null) return;

    await removeTeamMutate(teamToDeleteId);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';

    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

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
              + Add Team
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
                        No teams found.
                      </TableCell>
                    </TableRow>
                  )}
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell component="th" scope="row">
                        {team.name}
                      </TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <GroupIcon fontSize="small" />
                          {team.members.length}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(team.createdAt)}</TableCell>
                      <TableCell align="right">
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
          {selectedTeam ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TeamForm team={selectedTeam} onClose={closeForm} />
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
