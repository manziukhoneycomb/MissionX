import React from 'react';
import { useSnackbar } from 'notistack';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TeamForm from './TeamForm';
import AddMemberDialog from './AddMemberDialog';
import ConfirmationDialog from '../../../common/components/ConfirmationDialog';
import { useTeamManagementStore } from '../stores/teamManagementStore';
import { removeTeamMember } from '../teamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

interface TeamManagementWrapperProps {
  children: React.ReactNode;
}

const TeamManagementWrapper: React.FC<TeamManagementWrapperProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    isFormOpen,
    selectedTeam,
    closeForm,
    isAddMemberDialogOpen,
    selectedTeamForMember,
    closeAddMemberDialog,
    isConfirmRemoveMemberDialogOpen,
    memberToRemove,
    closeConfirmRemoveMemberDialog,
    resetRemoveMemberState,
  } = useTeamManagementStore();

  const { mutateAsync: removeMemberMutate, isPending: isRemovingMember } = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove member', {
        variant: 'error',
      });
    },
    onSettled: () => resetRemoveMemberState(),
  });

  const handleConfirmRemoveMember = async (): Promise<void> => {
    if (!memberToRemove) return;

    await removeMemberMutate({
      teamId: memberToRemove.teamId,
      userId: memberToRemove.userId,
    });
  };

  return (
    <>
      {children}

      <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TeamForm team={selectedTeam} onClose={closeForm} />
        </DialogContent>
      </Dialog>

      <AddMemberDialog
        open={isAddMemberDialogOpen}
        team={selectedTeamForMember}
        onClose={closeAddMemberDialog}
      />

      <ConfirmationDialog
        open={isConfirmRemoveMemberDialogOpen}
        onClose={closeConfirmRemoveMemberDialog}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToRemove?.user.firstName} ${memberToRemove?.user.lastName} (${memberToRemove?.user.email}) from the team?`}
        confirmText="Remove Member"
        confirmButtonProps={{ color: 'error', disabled: isRemovingMember }}
      />
    </>
  );
};

export default TeamManagementWrapper;