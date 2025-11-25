import React from 'react';
import { Formik, Form, Field } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '../types/team';
import {
  createTeam,
  updateTeam,
  CreateTeamRequest,
  UpdateTeamPayload,
} from '../teamMutations';
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
  name: Yup.string().max(255, 'Too Long!').required('Required'),
  description: Yup.string().optional(),
});

const TeamForm: React.FC<TeamFormProps> = ({ team, onClose }) => {
  const theme = useTheme();
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
    onError: () => {
      enqueueSnackbar('Failed to create team', { variant: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
      onClose();
    },
    onError: () => {
      enqueueSnackbar('Failed to update team', { variant: 'error' });
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
      const payload: CreateTeamRequest = {
        name: values.name,
        description: values.description || undefined,
      };
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={teamSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, errors, touched, handleChange, handleBlur }) => (
        <Form>
          <Box display="flex" flexDirection="column" gap={2}>
            <Field
              as={TextField}
              name="name"
              label="Team Name"
              fullWidth
              required
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              disabled={isSubmitting}
            />

            <Field
              as={TextField}
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description && !!errors.description}
              helperText={touched.description && errors.description}
              disabled={isSubmitting}
            />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                onClick={onClose}
                disabled={isSubmitting}
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={20} />}
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
