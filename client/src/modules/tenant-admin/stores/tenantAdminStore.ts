import { create } from 'zustand';
import { User } from '../../users/types/user';

interface TenantAdminState {
  // User management state
  isUserFormOpen: boolean;
  selectedUser: User | null;
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;

  // User management actions
  openCreateUserForm: () => void;
  openEditUserForm: (user: User) => void;
  closeUserForm: () => void;
  openConfirmDeleteDialog: (userId: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;
}

export const useTenantAdminStore = create<TenantAdminState>((set) => ({
  // Initial state
  isUserFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,

  // User management actions
  openCreateUserForm: () =>
    set({
      isUserFormOpen: true,
      selectedUser: null,
    }),

  openEditUserForm: (user: User) =>
    set({
      isUserFormOpen: true,
      selectedUser: user,
    }),

  closeUserForm: () =>
    set({
      isUserFormOpen: false,
      selectedUser: null,
    }),

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
}));