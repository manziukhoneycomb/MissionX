import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { useTeams } from './teamQueries';
import {
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from './teamMutations';
import { Team, CreateTeamInput, UpdateTeamInput } from './types/team';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const TeamsPage: React.FC = () => {
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const addTeamMember = useAddTeamMember();
  const removeTeamMember = useRemoveTeamMember();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [managingTeam, setManagingTeam] = useState<Team | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const handleCreateClick = () => {
    setEditingTeam(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (team: Team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTeamToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleMembersClick = (team: Team) => {
    setManagingTeam(team);
    setIsMembersOpen(true);
  };

  const handleFormSubmit = async (data: CreateTeamInput | UpdateTeamInput) => {
    if (editingTeam) {
      await updateTeam.mutateAsync({ id: editingTeam.id, data });
    } else {
      await createTeam.mutateAsync(data as CreateTeamInput);
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (teamToDelete) {
      await deleteTeam.mutateAsync(teamToDelete);
      setDeleteConfirmOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (managingTeam) {
      await addTeamMember.mutateAsync({ teamId: managingTeam.id, data: { userId } });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (managingTeam) {
      await removeTeamMember.mutateAsync({ teamId: managingTeam.id, userId });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
              <TableCell align="right">Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams?.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.description}</TableCell>
                <TableCell align="right">{team.users?.length || 0}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Manage Members">
                    <IconButton onClick={() => handleMembersClick(team)} color="primary">
                      <PeopleIcon />
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
        isLoading={createTeam.isPending || updateTeam.isPending}
      />

      {managingTeam && (
        <TeamMembersManager
          open={isMembersOpen}
          onClose={() => setIsMembersOpen(false)}
          team={teams?.find((t) => t.id === managingTeam.id) || managingTeam}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          isLoading={addTeamMember.isPending || removeTeamMember.isPending}
        />
      )}

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
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
