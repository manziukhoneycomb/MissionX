import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useTeams } from './teamQueries';
import { useCreateTeam, useUpdateTeam, useDeleteTeam } from './teamMutations';
import TeamForm from './components/TeamForm';
import { Team } from './types/team';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';
import TeamMembersManager from './components/TeamMembersManager';

const TeamsPage: React.FC = () => {
  const { data: teams, isLoading } = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isMembersManagerOpen, setMembersManagerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleCreateOpen = () => {
    setSelectedTeam(null);
    setFormOpen(true);
  };

  const handleEditOpen = (team: Team) => {
    setSelectedTeam(team);
    setFormOpen(true);
  };

  const handleDeleteOpen = (team: Team) => {
    setSelectedTeam(team);
    setDeleteConfirmOpen(true);
  };

  const handleMembersManagerOpen = (team: Team) => {
    setSelectedTeam(team);
    setMembersManagerOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setDeleteConfirmOpen(false);
    setMembersManagerOpen(false);
    setSelectedTeam(null);
  };

  const handleFormSubmit = (values: any) => {
    if (selectedTeam) {
      updateTeamMutation.mutate({ id: selectedTeam.id, data: values }, { onSuccess: handleClose });
    } else {
      createTeamMutation.mutate(values, { onSuccess: handleClose });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedTeam) {
      deleteTeamMutation.mutate(selectedTeam.id, { onSuccess: handleClose });
    }
  };

  return (
    <Container maxWidth={false}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Teams Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateOpen}>
          Create Team
        </Button>
      </Box>

      <Paper>
        <TableContainer>
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
                  <TableCell colSpan={4}>Loading...</TableCell>
                </TableRow>
              ) : (
                teams?.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.description}</TableCell>
                    <TableCell>{team.users?.length || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleMembersManagerOpen(team)}>
                        <GroupIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditOpen(team)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteOpen(team)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isFormOpen && (
        <TeamForm
          open={isFormOpen}
          onClose={handleClose}
          onSubmit={handleFormSubmit}
          team={selectedTeam}
        />
      )}

      {selectedTeam && isDeleteConfirmOpen && (
        <ConfirmationDialog
          open={isDeleteConfirmOpen}
          onClose={handleClose}
          onConfirm={handleDeleteConfirm}
          title="Delete Team"
          message={`Are you sure you want to delete the team "${selectedTeam.name}"? This action cannot be undone.`}
        />
      )}

      {selectedTeam && isMembersManagerOpen && (
        <Dialog open={isMembersManagerOpen} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>Manage Members for {selectedTeam.name}</DialogTitle>
          <DialogContent>
            <TeamMembersManager team={selectedTeam} />
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

export default TeamsPage;
