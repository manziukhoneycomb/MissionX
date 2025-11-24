import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { useGetTeams } from '../teamQueries';
import { useDeleteTeam } from '../teamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { TeamForm } from './TeamForm';
import { TeamMembersDialog } from './TeamMembersDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import useUserRoles from '../../../common/hooks/useUserRoles';
import { ROLES } from '../../../common/constants/roles';

export const TeamManagementPage: React.FC = () => {
  const theme = useTheme();
  const userRoles = useUserRoles();
  const { data: teams, isLoading } = useGetTeams();
  const deleteTeamMutation = useDeleteTeam();
  
  const {
    openCreateForm,
    openEditForm,
    openMembersDialog,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
  } = useTeamManagementStore();

  const canManageTeams = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  const handleDeleteTeam = async () => {
    if (teamToDeleteId) {
      try {
        await deleteTeamMutation.mutateAsync(teamToDeleteId);
        resetDeleteState();
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title="Teams Management"
          action={
            canManageTeams && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openCreateForm}
              >
                Create Team
              </Button>
            )
          }
        />
        <CardContent>
          {teams && teams.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Created At</TableCell>
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
                          icon={<GroupIcon />}
                          label={team.users.length}
                          size="small"
                          onClick={() => openMembersDialog(team)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(team.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {canManageTeams && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => openEditForm(team)}
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => openConfirmDeleteDialog(team.id)}
                              sx={{ color: theme.palette.error.main }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No teams found
              </Typography>
              {canManageTeams && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Create your first team to get started
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <TeamForm />
      <TeamMembersDialog />
      
      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        title="Delete Team"
        content="Are you sure you want to delete this team? This action cannot be undone."
        onConfirm={handleDeleteTeam}
        onCancel={closeConfirmDeleteDialog}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </Box>
  );
};