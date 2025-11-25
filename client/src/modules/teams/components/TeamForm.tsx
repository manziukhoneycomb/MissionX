import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Team, CreateTeamRequest } from '../types/team';
import { createTeam, updateTeam, UpdateTeamPayload } from '../teamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

type TeamFormProps = {
  team?: Team | null;
  onClose: () => void;
};

type TeamFormValues = {
  name: string;
  description: string;
};

const teamSchema = Yup.object().shape({
  name: Yup.string().max(255, 'Name is too long!').required('Name is required'),
  description: Yup.string().optional(),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const isEditing = !!team;

  const createMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create team', { variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      if (team) {
        queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, team.id] });
      }
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
      onClose();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update team', { variant: 'error' });
    },
  });

  const initialValues: TeamFormValues = {
    name: team?.name || '',
    description: team?.description || '',
  };

  const handleSubmit = (values: TeamFormValues) => {
    if (isEditing && team) {
      const payload: UpdateTeamPayload = {
        id: team.id,
        data: {
          name: values.name,
          description: values.description || undefined,
        },
      };
      updateMutation.mutate(payload);
    } else {
      const data: CreateTeamRequest = {
        name: values.name,
        description: values.description || undefined,
      };
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Formik initialValues={initialValues} validationSchema={teamSchema} onSubmit={handleSubmit}>
      {({ errors, touched, isValid }) => (
        <Form>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Field
              as={TextField}
              name="name"
              label="Team Name"
              variant="outlined"
              fullWidth
              required
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              disabled={isLoading}
            />

            <Field
              as={TextField}
              name="description"
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              disabled={isLoading}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={onClose} disabled={isLoading} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default TeamForm;
