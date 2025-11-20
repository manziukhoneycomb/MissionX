import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';
import { useTeams } from '../hooks/useTeams';
import {
  useDeleteTeam,
  useToggleTeamStatus,
  useUpdateTeamMember,
  useRemoveTeamMember,
} from '../hooks/useTeamMutations';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import TeamList from '../components/TeamList';
import TeamForm from '../components/TeamForm';
import TeamMembers from '../components/TeamMembers';
import AddMemberDialog from '../components/AddMemberDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { Team, TeamRole } from '../types/team';

type TeamManagementPageProps = Record<string, unknown>;

const TeamManagementPage: React.FC<TeamManagementPageProps> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const {
    isFormOpen,
    selectedTeam,
    isConfirmDeleteDialogOpen,
    teamToDeleteId,
    isConfirmToggleStatusDialogOpen,
    teamToToggleStatus,
    isMemberDialogOpen,
    selectedTeamForMembers,
    isAddMemberDialogOpen,
    openCreateForm,
    openEditForm,
    closeForm,
    openConfirmDeleteDialog,
    closeConfirmDeleteDialog,
    resetDeleteState,
    openConfirmToggleStatusDialog,
    closeConfirmToggleStatusDialog,
    resetToggleStatusState,
    openMemberDialog,
    closeMemberDialog,
    openAddMemberDialog,
    closeAddMemberDialog,
  } = useTeamManagementStore();

  const {
    data: teamsData,
    isLoading,
    error: teamsError,
  } = useTeams();

  useEffect(() => {
    if (teamsError) {
      enqueueSnackbar(teamsError.message || 'An error occurred while fetching teams', {
        variant: 'error',
      });
    }
  }, [teamsError, enqueueSnackbar]);

  const teams: Team[] = teamsData?.data ?? [];

  const deleteTeamMutation = useDeleteTeam();
  const toggleTeamStatusMutation = useToggleTeamStatus();
  const updateTeamMemberMutation = useUpdateTeamMember();
  const removeTeamMemberMutation = useRemoveTeamMember();

  const handleConfirmDelete = async (): Promise<void> => {
    if (teamToDeleteId === null) return;

    try {
      await deleteTeamMutation.mutateAsync(teamToDeleteId);
      resetDeleteState();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Delete team error:', error);
    }
  };

  const handleConfirmToggleStatus = async (): Promise<void> => {
    if (!teamToToggleStatus) return;

    const activate = !teamToToggleStatus.isActive;
    try {
      await toggleTeamStatusMutation.mutateAsync({
        id: teamToToggleStatus.id,
        activate,
      });
      resetToggleStatusState();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Toggle team status error:', error);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamRole): Promise<void> => {
    if (!selectedTeamForMembers) return;

    try {
      await updateTeamMemberMutation.mutateAsync({
        teamId: selectedTeamForMembers.id,
        userId: memberId,
        data: { teamRole: newRole },
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Update member role error:', error);
    }
  };

  const handleRemoveMember = async (memberId: string): Promise<void> => {
    if (!selectedTeamForMembers) return;

    try {
      await removeTeamMemberMutation.mutateAsync({
        teamId: selectedTeamForMembers.id,
        userId: memberId,
      });
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Remove member error:', error);
    }
  };

  const handleManageMembers = (team: Team) => {
    openMemberDialog(team);
  };

  const existingMemberIds = selectedTeamForMembers?.members?.map(member => member.user.id) || [];

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
          <TeamList
            teams={teams}
            isLoading={isLoading}
            onEdit={openEditForm}
            onDelete={openConfirmDeleteDialog}
            onToggleStatus={openConfirmToggleStatusDialog}
            onManageMembers={handleManageMembers}
            isDeleting={deleteTeamMutation.isPending}
            deletingTeamId={teamToDeleteId}
            isTogglingStatus={toggleTeamStatusMutation.isPending}
            toggleStatusTeamId={teamToToggleStatus?.id}
          />
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

      <TeamMembers
        open={isMemberDialogOpen}
        team={selectedTeamForMembers}
        onClose={closeMemberDialog}
        onAddMember={openAddMemberDialog}
        onUpdateMemberRole={handleUpdateMemberRole}
        onRemoveMember={handleRemoveMember}
        isLoading={updateTeamMemberMutation.isPending || removeTeamMemberMutation.isPending}
      />

      <AddMemberDialog
        open={isAddMemberDialogOpen}
        teamId={selectedTeamForMembers?.id || null}
        onClose={closeAddMemberDialog}
        existingMemberIds={existingMemberIds}
      />

      <ConfirmationDialog
        open={isConfirmDeleteDialogOpen}
        onClose={closeConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete this team? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonProps={{ color: 'error', disabled: deleteTeamMutation.isPending }}
      />

      <ConfirmationDialog
        open={isConfirmToggleStatusDialogOpen}
        onClose={closeConfirmToggleStatusDialog}
        onConfirm={handleConfirmToggleStatus}
        title={teamToToggleStatus?.isActive ? 'Deactivate Team' : 'Activate Team'}
        message={`Are you sure you want to ${teamToToggleStatus?.isActive ? 'deactivate' : 'activate'} team "${teamToToggleStatus?.name || ''}"?`}
        confirmText={teamToToggleStatus?.isActive ? 'Deactivate' : 'Activate'}
        confirmButtonProps={{
          color: teamToToggleStatus?.isActive ? 'warning' : 'success',
          disabled: toggleTeamStatusMutation.isPending,
        }}
      />
    </Box>
  );
};

export default TeamManagementPage;