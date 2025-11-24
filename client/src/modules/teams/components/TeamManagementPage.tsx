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
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import TeamForm from './TeamForm';
import TeamMembersDialog from './TeamMembersDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';
import { useGetTeams } from '../teamQueries';
import { useDeleteTeam } from '../teamMutations';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

type TeamManagementPageProps = Record<string, unknown>;

const TeamManagementPage: React.FC<TeamManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const theme = useTheme();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const userRoles = useUserRoles();
  const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

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
    data: teamsData,
    isLoading,
    error: teamsError,
  } = useGetTeams(page + 1, rowsPerPage, {
    staleTime: CACHE_TIMES.DEFAULT,
  });

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const teams: Team[] = teamsData?.items ?? [];
  const totalTeams = teamsData?.total ?? 0;

  const { mutateAsync: removeTeamMutate, isPending: isDeleting } = useDeleteTeam();

  const handleConfirmDelete = async (): Promise<void> => {
    if (teamToDeleteId === null) return;

    try {
      await removeTeamMutate(teamToDeleteId);
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete team', { variant: 'error' });
    } finally {
      resetDeleteState();
    }
  };

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            <>
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
                      {isSuperAdmin && <TableCell>Tenant</TableCell>}
                      <TableCell align="center">Members</TableCell>
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
                        <TableCell colSpan={isSuperAdmin ? 6 : 5} align="center" sx={{ py: 3 }}>
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
                        {isSuperAdmin && <TableCell>{team.tenant?.name ?? 'N/A'}</TableCell>}
                        <TableCell align="center">{team.users?.length || 0}</TableCell>
                        <TableCell>{formatDate(team.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Manage Members">
                            <IconButton
                              onClick={() => openMembersDialog(team)}
                              size="small"
                              color="primary"
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalTeams}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
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
        message={`Are you sure you want to delete team #${teamToDeleteId}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: isDeleting }}
      />
    </Box>
  );
};

export default TeamManagementPage;