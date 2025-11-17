import { create } from 'zustand';
import { User } from '../../users/types/user';

interface TenantAdminState {
  // User management form state
  isFormOpen: boolean;
  selectedUser: User | null;

  // Delete user confirmation state
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;

  // Toggle user status confirmation state
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;

  // Invite user dialog state
  isInviteDialogOpen: boolean;

  // Actions
  openCreateForm: () => void;
  openEditForm: (user: User) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (userId: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;

  openInviteDialog: () => void;
  closeInviteDialog: () => void;
}

export const useTenantAdminStore = create<TenantAdminState>((set) => ({
  // Initial state
  isFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,
  isInviteDialogOpen: false,

  // User management form actions
  openCreateForm: () =>
    set({
      isFormOpen: true,
      selectedUser: null,
    }),

  openEditForm: (user: User) =>
    set({
      isFormOpen: true,
      selectedUser: user,
    }),

  closeForm: () =>
    set({
      isFormOpen: false,
      selectedUser: null,
    }),

  // Delete user confirmation actions
  openConfirmDeleteDialog: (userId: string) =>
    set({
      isConfirmDeleteDialogOpen: true,
      userToDeleteId: userId,
    }),

  closeConfirmDeleteDialog: () =>
    set({
      isConfirmDeleteDialogOpen: false,
    }),

  resetDeleteState: () =>
    set({
      isConfirmDeleteDialogOpen: false,
      userToDeleteId: null,
    }),

  // Toggle user status confirmation actions
  openConfirmToggleStatusDialog: (user: User) =>
    set({
      isConfirmToggleStatusDialogOpen: true,
      userToToggleStatus: user,
    }),

  closeConfirmToggleStatusDialog: () =>
    set({
      isConfirmToggleStatusDialogOpen: false,
    }),

  resetToggleStatusState: () =>
    set({
      isConfirmToggleStatusDialogOpen: false,
      userToToggleStatus: null,
    }),

  // Invite user dialog actions
  openInviteDialog: () =>
    set({
      isInviteDialogOpen: true,
    }),

  closeInviteDialog: () =>
    set({
      isInviteDialogOpen: false,
    }),
}));