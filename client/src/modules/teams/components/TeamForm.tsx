import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CreateTeamInput, UpdateTeamInput, Team } from '../types/team';

interface TeamFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamInput | UpdateTeamInput) => void;
  initialData?: Team;
  isLoading?: boolean;
}

const TeamForm: React.FC<TeamFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const { control, handleSubmit, reset } = useForm<CreateTeamInput>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
      });
    } else {
      reset({ name: '', description: '' });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: CreateTeamInput) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Team' : 'Create Team'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Team name is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamForm;
