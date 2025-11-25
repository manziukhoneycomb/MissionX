import React, { useState } from 'react';
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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Team } from './types/team';
import { useTeams } from './teamQueries';
import { useDeleteTeam } from './teamMutations';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const TeamsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [teamForMembers, setTeamForMembers] = useState<Team | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data: teams = [], isLoading, error } = useTeams();
  const deleteTeamMutation = useDeleteTeam();

  React.useEffect(() => {
    if (error) {
      enqueueSnackbar('Failed to load teams', { variant: 'error' });
    }
  }, [error, enqueueSnackbar]);

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsFormOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeam(null);
  };

  const handleManageMembers = (team: Team) => {
    setTeamForMembers(team);
    setIsMembersDialogOpen(true);
  };

  const handleCloseMembersDialog = () => {
    setIsMembersDialogOpen(false);
    setTeamForMembers(null);
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      await deleteTeamMutation.mutateAsync(teamToDelete.id);
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete team', { variant: 'error' });
    }

    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const formatDate = (dateString: string): string => {
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
              Teams
            </Typography>
          }
          action={
            <Button
              variant="contained"
              onClick={handleCreateTeam}
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
              <Table stickyHeader aria-label="teams table">
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
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {team.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {team.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<GroupIcon />}
                          label={`${team.users.length} member${team.users.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(team.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Members">
                          <IconButton
                            onClick={() => handleManageMembers(team)}
                            size="small"
                            color="info"
                            sx={{ mr: 0.5 }}>
                            <GroupIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Team">
                          <IconButton
                            onClick={() => handleEditTeam(team)}
                            size="small"
                            color="primary"
                            sx={{ mr: 0.5 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Team">
                          <IconButton
                            onClick={() => handleDeleteTeam(team)}
                            size="small"
                            color="error"
                            disabled={deleteTeamMutation.isPending}>
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

      {/* Team Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
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
          <TeamForm team={selectedTeam} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      {/* Members Manager Dialog */}
      {teamForMembers && (
        <TeamMembersManager
          team={teamForMembers}
          open={isMembersDialogOpen}
          onClose={handleCloseMembersDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${teamToDelete?.name}"? This will remove all user associations but users will remain in the system.`}
        confirmText="Delete"
        confirmButtonProps={{ 
          color: 'error', 
          disabled: deleteTeamMutation.isPending 
        }}
      />
    </Box>
  );
};

export default TeamsPage;