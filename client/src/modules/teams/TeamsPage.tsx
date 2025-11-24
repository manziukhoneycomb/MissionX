import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useTeams } from './teamQueries';
import { useCreateTeam, useUpdateTeam, useDeleteTeam } from './teamMutations';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import { Team, CreateTeamInput } from './types/team';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const TeamsPage: React.FC = () => {
  const { data: teams, isLoading, error } = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreateClick = () => {
    setEditingTeam(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleManageMembersClick = (team: Team) => {
    setManagingTeam(team);
    setIsMembersOpen(true);
  };

  const handleFormSubmit = (data: CreateTeamInput) => {
    if (editingTeam) {
      updateTeamMutation.mutate(
        { id: editingTeam.id, data },
        {
          onSuccess: () => setIsFormOpen(false),
        },
      );
    } else {
      createTeamMutation.mutate(data, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteTeamMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4 }}>
        Error loading teams.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Teams</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
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
            {teams?.map((team) => (
              <TableRow key={team.id}>
                <TableCell component="th" scope="row">
                  {team.name}
                </TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell>{team.users?.length || 0}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Manage Members">
                    <IconButton onClick={() => handleManageMembersClick(team)} color="primary">
                      <GroupIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditClick(team)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteClick(team.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {teams?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No teams found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TeamForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTeam}
        isLoading={createTeamMutation.isPending || updateTeamMutation.isPending}
      />

      {managingTeam && (
        <TeamMembersManager
          open={isMembersOpen}
          onClose={() => {
            setIsMembersOpen(false);
            setManagingTeam(null);
          }}
          teamId={managingTeam.id}
          teamName={managingTeam.name}
        />
      )}

      <ConfirmationDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team? Users will be unassigned but not deleted."
        confirmText="Delete"
        confirmButtonProps={{ color: 'error' }}
      />
    </Box>
  );
};

export default TeamsPage;
