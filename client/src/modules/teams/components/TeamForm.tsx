import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { CreateTeamInput, UpdateTeamInput, Team } from '../types/team';

type TeamFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamInput | UpdateTeamInput) => Promise<void>;
  team?: Team;
  isLoading?: boolean;
};

const TeamForm: React.FC<TeamFormProps> = ({ open, onClose, onSubmit, team, isLoading }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput | UpdateTeamInput>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [team, reset]);

  const handleFormSubmit = async (data: CreateTeamInput | UpdateTeamInput) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{team ? 'Edit Team' : 'Create Team'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Team name is required',
                maxLength: {
                  value: 255,
                  message: 'Team name must be less than 255 characters',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Team Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {team ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TeamForm;