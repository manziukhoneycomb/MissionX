import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useTeams } from './teamQueries';
import { useDeleteTeam, useCreateTeam, useUpdateTeam } from './teamMutations';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import { CreateTeamInput, Team, UpdateTeamInput } from './types/team';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const TeamsPage: React.FC = () => {
  const { data: teams, isLoading } = useTeams();
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCreateClick = () => {
    setSelectedTeam(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setIsFormOpen(true);
  };

  const handleMembersClick = (team: Team) => {
    setSelectedTeam(team);
    setIsMembersOpen(true);
  };

  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (values: CreateTeamInput | UpdateTeamInput) => {
    if (selectedTeam) {
      updateMutation.mutate(
        { id: selectedTeam.id, data: values as UpdateTeamInput },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createMutation.mutate(values as CreateTeamInput, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedTeam) {
      deleteMutation.mutate(selectedTeam.id, {
        onSuccess: () => setIsDeleteDialogOpen(false),
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teams</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Team
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : teams?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No teams found</TableCell>
              </TableRow>
            ) : (
              teams?.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.description}</TableCell>
                  <TableCell>{team.users?.length || 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Manage Members">
                      <IconButton onClick={() => handleMembersClick(team)} color="info">
                        <GroupIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClick(team)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(team)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TeamForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedTeam}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <TeamMembersManager
        open={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        team={selectedTeam}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete team "${selectedTeam?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonProps={{ color: 'error' }}
      />
    </Box>
  );
};

export default TeamsPage;
