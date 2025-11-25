import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
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
import PeopleIcon from '@mui/icons-material/People';
import { Team } from './types/team';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';
import { useTeams } from './teamQueries';
import { useDeleteTeam } from './teamMutations';

const TeamsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [teamForMembers, setTeamForMembers] = useState<Team | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data: teams, isLoading, error } = useTeams();
  const { mutateAsync: deleteTeamMutate, isPending: isDeleting } = useDeleteTeam();

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [error, enqueueSnackbar]);

  const handleOpenCreateForm = () => {
    setSelectedTeam(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (team: Team) => {
    setSelectedTeam(team);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeam(null);
  };

  const handleOpenMembersDialog = (team: Team) => {
    setTeamForMembers(team);
    setIsMembersDialogOpen(true);
  };

  const handleCloseMembersDialog = () => {
    setIsMembersDialogOpen(false);
    setTeamForMembers(null);
  };

  const handleOpenConfirmDelete = (team: Team) => {
    setTeamToDelete(team);
    setIsConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
    setTeamToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeamMutate(teamToDelete.id);
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
      handleCloseConfirmDelete();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to delete team',
        { variant: 'error' }
      );
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Teams Management"
          action={
            <Button variant="contained" onClick={handleOpenCreateForm}>
              Create Team
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : teams && teams.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No teams found. Create your first team to get started.
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
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams?.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        {team.description || (
                          <Typography variant="body2" color="text.secondary">
                            No description
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{team.members.length}</TableCell>
                      <TableCell>{formatDate(team.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Members">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenMembersDialog(team)}>
                            <PeopleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditForm(team)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleOpenConfirmDelete(team)}>
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

      <TeamForm open={isFormOpen} team={selectedTeam} onClose={handleCloseForm} />

      <TeamMembersManager
        open={isMembersDialogOpen}
        team={teamForMembers}
        onClose={handleCloseMembersDialog}
      />

      <ConfirmationDialog
        open={isConfirmDeleteOpen}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${teamToDelete?.name}"? All members will be unassigned from this team.`}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{ disabled: isDeleting }}
      />
    </Box>
  );
};

export default TeamsPage;
