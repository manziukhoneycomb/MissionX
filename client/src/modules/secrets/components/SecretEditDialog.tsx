import React from 'react';
import { useSnackbar } from 'notistack';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setSecret } from '../secretMutations';
import { useSecretEditDialogStore } from '../stores/secretEditDialogStore';
import { SECRET_QUERY_KEYS } from '../secretQueryKeys';

const SecretEditDialog: React.FC = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { isOpen, secretKey, currentValue, newValue, closeDialog, setNewValue } =
    useSecretEditDialogStore();

  const { mutateAsync: updateSecretMutate, isPending } = useMutation({
    mutationFn: setSecret,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECRET_QUERY_KEYS.GET_SECRETS] });
      closeDialog();
    },
    onError: (err) => {
      enqueueSnackbar(err.message || 'Failed to save secret', {
        variant: 'error',
      });
    },
  });

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setNewValue(event.target.value);
  };

  const handleSaveClick = async (): Promise<void> => {
    if (!secretKey) return;

    await updateSecretMutate({ key: secretKey, value: newValue });
  };

  const handleCancelClick = (): void => {
    closeDialog();
  };

  const isSaveDisabled = isPending || !secretKey || newValue === (currentValue ?? '');

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={isPending ? undefined : handleCancelClick}
      maxWidth="sm"
      fullWidth>
      <DialogTitle>Edit Secret: {secretKey ?? ''}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Secret Value"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={newValue}
            onChange={handleValueChange}
            disabled={isPending}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancelClick} color="inherit" disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
          variant="contained"
          color="primary"
          disabled={isSaveDisabled}
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SecretEditDialog;
