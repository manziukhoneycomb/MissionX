import { create } from 'zustand';
import { User } from '../../users/types/user';

interface TenantAdminState {
  isInviteDialogOpen: boolean;
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;
  isConfirmCancelInviteDialogOpen: boolean;
  invitationToCancelId: string | null;
  
  openInviteDialog: () => void;
  closeInviteDialog: () => void;
  
  openConfirmDeleteDialog: (userId: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;
  
  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;
  
  openConfirmCancelInviteDialog: (invitationId: string) => void;
  closeConfirmCancelInviteDialog: () => void;
  resetCancelInviteState: () => void;
}

export const useTenantAdminStore = create<TenantAdminState>((set) => ({
  isInviteDialogOpen: false,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,
  isConfirmCancelInviteDialogOpen: false,
  invitationToCancelId: null,

  openInviteDialog: () => set({ isInviteDialogOpen: true }),
  closeInviteDialog: () => set({ isInviteDialogOpen: false }),

  openConfirmDeleteDialog: (userId: string) =>
    set({ isConfirmDeleteDialogOpen: true, userToDeleteId: userId }),
  closeConfirmDeleteDialog: () => set({ isConfirmDeleteDialogOpen: false }),
  resetDeleteState: () => set({ userToDeleteId: null, isConfirmDeleteDialogOpen: false }),

  openConfirmToggleStatusDialog: (user: User) =>
    set({ isConfirmToggleStatusDialogOpen: true, userToToggleStatus: user }),
  closeConfirmToggleStatusDialog: () => set({ isConfirmToggleStatusDialogOpen: false }),
  resetToggleStatusState: () => 
    set({ userToToggleStatus: null, isConfirmToggleStatusDialogOpen: false }),

  openConfirmCancelInviteDialog: (invitationId: string) =>
    set({ isConfirmCancelInviteDialogOpen: true, invitationToCancelId: invitationId }),
  closeConfirmCancelInviteDialog: () => set({ isConfirmCancelInviteDialogOpen: false }),
  resetCancelInviteState: () => 
    set({ invitationToCancelId: null, isConfirmCancelInviteDialogOpen: false }),
}));