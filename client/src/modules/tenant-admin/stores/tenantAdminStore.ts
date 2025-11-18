import { create } from 'zustand';
import { User } from '../../users/types/user';

interface TenantAdminStore {
  // User management form state
  isUserFormOpen: boolean;
  isInviteFormOpen: boolean;
  selectedUser: User | null;
  
  // Delete confirmation state
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;
  
  // Toggle status confirmation state
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;

  // Actions for user form management
  openCreateUserForm: () => void;
  openEditUserForm: (user: User) => void;
  closeUserForm: () => void;
  
  // Actions for invite form management
  openInviteForm: () => void;
  closeInviteForm: () => void;

  // Actions for delete confirmation
  openConfirmDeleteDialog: (userId: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  // Actions for toggle status confirmation
  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;
}

export const useTenantAdminStore = create<TenantAdminStore>((set) => ({
  // Initial state
  isUserFormOpen: false,
  isInviteFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,

  // User form management
  openCreateUserForm: () =>
    set(() => ({
      isUserFormOpen: true,
      selectedUser: null,
    })),

  openEditUserForm: (user: User) =>
    set(() => ({
      isUserFormOpen: true,
      selectedUser: user,
    })),

  closeUserForm: () =>
    set(() => ({
      isUserFormOpen: false,
      selectedUser: null,
    })),

  // Invite form management
  openInviteForm: () =>
    set(() => ({
      isInviteFormOpen: true,
    })),

  closeInviteForm: () =>
    set(() => ({
      isInviteFormOpen: false,
    })),

  // Delete confirmation management
  openConfirmDeleteDialog: (userId: string) =>
    set(() => ({
      isConfirmDeleteDialogOpen: true,
      userToDeleteId: userId,
    })),

  closeConfirmDeleteDialog: () =>
    set(() => ({
      isConfirmDeleteDialogOpen: false,
    })),

  resetDeleteState: () =>
    set(() => ({
      isConfirmDeleteDialogOpen: false,
      userToDeleteId: null,
    })),

  // Toggle status confirmation management
  openConfirmToggleStatusDialog: (user: User) =>
    set(() => ({
      isConfirmToggleStatusDialogOpen: true,
      userToToggleStatus: user,
    })),

  closeConfirmToggleStatusDialog: () =>
    set(() => ({
      isConfirmToggleStatusDialogOpen: false,
    })),

  resetToggleStatusState: () =>
    set(() => ({
      isConfirmToggleStatusDialogOpen: false,
      userToToggleStatus: null,
    })),
}));