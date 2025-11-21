import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import InviteUserForm from './invite-user-form';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserInvited: () => void;
}

const InviteUserDialog: React.FC<InviteUserDialogProps> = ({
  open,
  onClose,
  onUserInvited,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}>
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        Invite New User
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <InviteUserForm
          onClose={onClose}
          onUserInvited={onUserInvited}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;