import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useTeams } from './teamQueries';
import { useCreateTeam, useUpdateTeam, useDeleteTeam } from './teamMutations';
import { Team } from './types/team';
import TeamForm from './components/TeamForm';
import TeamMembersManager from './components/TeamMembersManager';
import ConfirmationDialog from '../../common/components/ConfirmationDialog';

const TeamsPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const { data: teams, isLoading } = useTeams();
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const deleteMutation = useDeleteTeam();

  const handleCreateClick = () => {
    setSelectedTeam(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (team: Team) => {
    setSelectedTeam(team);
    setFormOpen(true);
  };

  const handleManageMembersClick = (team: Team) => {
    setSelectedTeam(team);
    setMembersOpen(true);
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedTeam) {
      await updateMutation.mutateAsync({ id: selectedTeam.id, input: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (teamToDelete) {
      await deleteMutation.mutateAsync(teamToDelete.id);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Teams Management
      </Typography>

      <Card>
        <CardHeader
          title="Teams"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Team
            </Button>
          }
        />
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : teams && teams.length > 0 ? (
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
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.description || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={team.users.length}
                          size="small"
                          color={team.users.length > 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(team.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Members">
                          <IconButton
                            size="small"
                            onClick={() => handleManageMembersClick(team)}
                          >
                            <GroupIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(team)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(team)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No teams found. Click "Create Team" to add your first team.
            </Typography>
          )}
        </CardContent>
      </Card>

      <TeamForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        team={selectedTeam}
        isLoading={isFormLoading}
      />

      {selectedTeam && membersOpen && (
        <TeamMembersManager
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          team={selectedTeam}
        />
      )}

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        title="Delete Team"
        content={
          teamToDelete
            ? `Are you sure you want to delete "${teamToDelete.name}"? Users will remain in the tenant but will be unassigned from this team.`
            : ''
        }
      />
    </Box>
  );
};

export default TeamsPage;